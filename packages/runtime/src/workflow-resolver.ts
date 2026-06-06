import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { WorkflowSchema, type Workflow } from '@skillspace/schema';
import { getSkillspacePath } from './config.js';

export class WorkflowResolver {
  private globalDir: string;
  private cacheDir: string;

  constructor() {
    this.globalDir = path.join(getSkillspacePath(), 'workflows');
    this.cacheDir = path.join(getSkillspacePath(), 'cache', 'workflows');
    
    if (!fs.existsSync(this.globalDir)) {
      fs.mkdirSync(this.globalDir, { recursive: true });
    }
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Resolves a workflow definition from the tiered resolution strategy:
   * 1. Explicit path (starts with ./, ../, /, or ends with .yaml)
   * 2. Local project (.skillspace/workflows/ or workflows/)
   * 3. Global (~/.skillspace/workflows/)
   * 4. Remote (http/https or github:org/repo@v)
   */
  async resolve(name: string): Promise<Workflow> {
    const rawYaml = await this.fetchRawYaml(name);
    
    // Parse YAML
    let data;
    try {
      data = parseYaml(rawYaml);
    } catch (err) {
      throw new Error(`Failed to parse workflow YAML for "${name}": ${err instanceof Error ? err.message : String(err)}`);
    }

    // Validate against Schema
    const result = WorkflowSchema.safeParse(data);
    if (!result.success) {
      const errorMsg = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid workflow definition for "${name}": ${errorMsg}`);
    }

    return result.data;
  }

  private async fetchRawYaml(name: string): Promise<string> {
    const cwd = process.cwd();

    // 1. Explicit path or remote URL
    if (name.startsWith('http://') || name.startsWith('https://')) {
      return this.fetchRemote(name, name);
    }
    if (name.startsWith('github:')) {
      return this.fetchGithub(name);
    }
    if (name.startsWith('./') || name.startsWith('../') || name.startsWith('/') || name.endsWith('.yaml') || name.endsWith('.yml')) {
      const target = path.resolve(cwd, name);
      if (fs.existsSync(target)) {
        return fs.readFileSync(target, 'utf-8');
      }
      throw new Error(`Workflow file not found at ${target}`);
    }

    // 2. Local project scope
    const localSkillspace = path.join(cwd, '.skillspace', 'workflows', `${name}.yaml`);
    if (fs.existsSync(localSkillspace)) return fs.readFileSync(localSkillspace, 'utf-8');

    const localWorkflows = path.join(cwd, 'workflows', `${name}.yaml`);
    if (fs.existsSync(localWorkflows)) return fs.readFileSync(localWorkflows, 'utf-8');

    // 3. Global scope
    const globalWorkflow = path.join(this.globalDir, `${name}.yaml`);
    if (fs.existsSync(globalWorkflow)) return fs.readFileSync(globalWorkflow, 'utf-8');

    throw new Error(`Workflow "${name}" not found locally, in project, or globally.`);
  }

  private async fetchGithub(shorthand: string): Promise<string> {
    // github:org/repo/workflow@v1
    const match = shorthand.match(/^github:([^\/]+)\/([^\/]+)\/(.+)@(.+)$/);
    if (!match) {
      throw new Error(`Invalid GitHub shorthand format. Expected github:org/repo/path/to/workflow@version`);
    }
    const [_, org, repo, filePath, version] = match;
    // append .yaml if missing
    const finalPath = filePath.endsWith('.yaml') || filePath.endsWith('.yml') ? filePath : `${filePath}.yaml`;
    const url = `https://raw.githubusercontent.com/${org}/${repo}/${version}/${finalPath}`;
    
    return this.fetchRemote(url, shorthand);
  }

  private async fetchRemote(url: string, cacheKey: string): Promise<string> {
    // Basic TTL cache lookup
    const safeKey = cacheKey.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cachedPath = path.join(this.cacheDir, `${safeKey}.yaml`);
    
    if (fs.existsSync(cachedPath)) {
      const stats = fs.statSync(cachedPath);
      const ageMs = Date.now() - stats.mtimeMs;
      if (ageMs < 1000 * 60 * 60) { // 1 hour TTL
        return fs.readFileSync(cachedPath, 'utf-8');
      }
    }

    console.log(`Fetching remote workflow: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch workflow from ${url} (status ${res.status})`);
    }

    const text = await res.text();
    fs.writeFileSync(cachedPath, text, 'utf-8');
    return text;
  }
}
