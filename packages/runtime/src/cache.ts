import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import YAML from 'yaml';
import { validateSkill, validateAgent } from '@skillspace/schema';
import type { Skill, Agent } from '@skillspace/schema';
import { getRegistryPath, ensureSkillspaceDir } from './config.js';

// ---------------------------------------------------------------------------
// Cache: manages ~/.skillspace/registry/<name>@<version>/
// ---------------------------------------------------------------------------

export class SkillCache {
  private registryDir: string;

  constructor(registryDir?: string) {
    this.registryDir = registryDir ?? getRegistryPath();
    ensureSkillspaceDir();
  }

  /**
   * Install a package from a .skillpkg Buffer into the local registry.
   * Extracts to ~/.skillspace/registry/<name>@<version>/
   *
   * @param expectedChecksum - Optional SHA-256 checksum to verify (format: "sha256:<hex>")
   */
  async installPackage(
    name: string,
    version: string,
    files: Map<string, Buffer>,
    expectedChecksum?: string,
  ): Promise<string> {
    // Verify checksum before writing anything
    if (expectedChecksum) {
      const actualChecksum = this.computeChecksum(files);
      if (actualChecksum !== expectedChecksum) {
        throw new Error(
          `Checksum mismatch for ${name}@${version}: expected ${expectedChecksum}, got ${actualChecksum}`,
        );
      }
    }

    const pkgDir = this.getPackageDir(name, version);

    // Create directory
    fs.mkdirSync(pkgDir, { recursive: true });

    // Write all files
    for (const [filePath, content] of files) {
      const fullPath = path.join(pkgDir, filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }

    return pkgDir;
  }

  /**
   * Compute a SHA-256 checksum over all files in a package.
   * Deterministic: iterates files sorted by name.
   */
  computeChecksum(files: Map<string, Buffer>): string {
    const hash = crypto.createHash('sha256');
    const sortedKeys = [...files.keys()].sort();
    for (const key of sortedKeys) {
      hash.update(key);
      hash.update(files.get(key)!);
    }
    return `sha256:${hash.digest('hex')}`;
  }

  /**
   * Remove a package from the local registry.
   */
  removePackage(name: string, version: string): void {
    const pkgDir = this.getPackageDir(name, version);
    if (fs.existsSync(pkgDir)) {
      fs.rmSync(pkgDir, { recursive: true, force: true });
    }
  }

  /**
   * Check if a package is installed locally.
   */
  isInstalled(name: string, version: string): boolean {
    const dir = this.getPackageDir(name, version);
    return fs.existsSync(path.join(dir, 'skill.yaml')) || fs.existsSync(path.join(dir, 'agent.yaml'));
  }

  /**
   * Load and parse the skill.yaml from a locally installed package.
   */
  loadSkill(name: string, version: string): Skill {
    const pkgDir = this.getPackageDir(name, version);
    const skillYamlPath = path.join(pkgDir, 'skill.yaml');

    if (!fs.existsSync(skillYamlPath)) {
      throw new Error(`Skill not found: ${name}@${version} not installed locally`);
    }

    const raw = fs.readFileSync(skillYamlPath, 'utf-8');
    const parsed = YAML.parse(raw);
    const result = validateSkill(parsed);

    if (!result.success) {
      throw new Error(
        `Invalid skill.yaml for ${name}@${version}: ${result.errors.message}`,
      );
    }

    return result.data;
  }

  /**
   * List all installed packages.
   */
  listInstalled(): Array<{ name: string; version: string; path: string }> {
    if (!fs.existsSync(this.registryDir)) {
      return [];
    }

    const entries = fs.readdirSync(this.registryDir, { withFileTypes: true });
    const packages: Array<{ name: string; version: string; path: string }> = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const atIndex = entry.name.lastIndexOf('@');
      if (atIndex <= 0) continue; // skip invalid entries

      const name = entry.name.substring(0, atIndex);
      const version = entry.name.substring(atIndex + 1);
      const pkgPath = path.join(this.registryDir, entry.name);

      // Verify it has a skill.yaml
      if (fs.existsSync(path.join(pkgPath, 'skill.yaml'))) {
        packages.push({ name, version, path: pkgPath });
      }
    }

    return packages;
  }

  /**
   * Get all installed versions of a package.
   */
  getInstalledVersions(name: string): string[] {
    return this.listInstalled()
      .filter((pkg) => pkg.name === name)
      .map((pkg) => pkg.version);
  }

  /**
   * Get the directory path for a package.
   */
  getPackageDir(name: string, version: string): string {
    return path.join(this.registryDir, `${name}@${version}`);
  }

  /**
   * Read the README.md from a package if it exists.
   */
  getReadme(name: string, version: string): string | null {
    const readmePath = path.join(this.getPackageDir(name, version), 'README.md');
    try {
      return fs.readFileSync(readmePath, 'utf-8');
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Agent support
  // ---------------------------------------------------------------------------

  loadAgent(name: string, version: string): Agent {
    const pkgDir = this.getPackageDir(name, version);
    let agentYamlPath = path.join(pkgDir, 'agent.yaml');
    
    if (!fs.existsSync(agentYamlPath)) {
      agentYamlPath = path.join(pkgDir, 'skill.yaml');
    }

    if (!fs.existsSync(agentYamlPath)) {
      throw new Error(`Agent not found: ${name}@${version} not installed locally`);
    }

    const raw = fs.readFileSync(agentYamlPath, 'utf-8');
    const parsed = YAML.parse(raw);
    
    // We parse it using validateAgent to ensure it conforms to Agent schema
    const result = validateAgent(parsed);

    if (!result.success) {
      throw new Error(
        `Invalid agent manifest for ${name}@${version}: ${result.errors.message}`,
      );
    }

    return result.data;
  }

  listInstalledAgents(): Array<{ name: string; version: string; path: string }> {
    if (!fs.existsSync(this.registryDir)) {
      return [];
    }

    const entries = fs.readdirSync(this.registryDir, { withFileTypes: true });
    const packages: Array<{ name: string; version: string; path: string }> = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const atIndex = entry.name.lastIndexOf('@');
      if (atIndex <= 0) continue;

      const name = entry.name.substring(0, atIndex);
      const version = entry.name.substring(atIndex + 1);
      const pkgPath = path.join(this.registryDir, entry.name);

      let manifestPath = path.join(pkgPath, 'agent.yaml');
      if (!fs.existsSync(manifestPath)) {
        manifestPath = path.join(pkgPath, 'skill.yaml');
      }

      if (fs.existsSync(manifestPath)) {
        try {
          const raw = fs.readFileSync(manifestPath, 'utf-8');
          const parsed = YAML.parse(raw);
          // If the file is literally agent.yaml, or if it's skill.yaml with type='agent'
          if (parsed.type === 'agent' || path.basename(manifestPath) === 'agent.yaml') {
            packages.push({ name, version, path: pkgPath });
          }
        } catch {
          // Skip packages with unreadable manifests
        }
      }
    }

    return packages;
  }

  getInstalledAgentVersions(name: string): string[] {
    return this.listInstalledAgents()
      .filter((pkg) => pkg.name === name)
      .map((pkg) => pkg.version);
  }
}
