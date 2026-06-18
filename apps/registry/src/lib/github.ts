/**
 * GitHub API integration for SkillSpace.
 * Fetches skill.yaml / agent.yaml content from public GitHub repos.
 */

import * as yaml from 'js-yaml';

const GITHUB_API = 'https://api.github.com';

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface GitHubFileContent {
  content: string;
  sha: string;
  size: number;
}

export interface GitHubPackageManifest {
  raw: string;
  parsed: Record<string, unknown>;
  sha: string;
  size: number;
}

/**
 * Parse a GitHub URL into owner/repo/branch/path components.
 * Supports formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo/tree/main/path/to/skill.yaml
 *   - https://github.com/owner/repo/blob/main/path/to/skill.yaml
 *   - owner/repo  (shorthand used in CLI and dashboard)
 */
export function parseGitHubUrl(input: string): GitHubRepoInfo | null {
  // Handle shorthand: "owner/repo" or "owner/repo/path/to/skill.yaml"
  if (!input.startsWith('http') && input.includes('/') && !input.includes(' ')) {
    const parts = input.split('/');
    if (parts.length >= 2) {
      return {
        owner: parts[0],
        repo: parts[1],
        branch: 'main',
        path: parts.length > 2 ? parts.slice(2).join('/') : 'skill.yaml',
      };
    }
  }

  try {
    const parsed = new URL(input);
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1];

    let branch = 'main';
    let path = 'skill.yaml';

    if (parts.length >= 4 && (parts[2] === 'tree' || parts[2] === 'blob')) {
      branch = parts[3] || 'main';
      const rest = parts.slice(4);
      if (rest.length > 0) {
        path = rest.join('/');
      }
    }

    return { owner, repo, branch, path };
  } catch {
    return null;
  }
}

/**
 * Build the raw.githubusercontent.com URL for a file.
 */
export function rawGitHubUrl(info: GitHubRepoInfo, commit?: string): string {
  const ref = commit || info.branch;
  return `https://raw.githubusercontent.com/${info.owner}/${info.repo}/${ref}/${info.path}`;
}

/**
 * Fetch a file from GitHub. Uses the Contents API for accurate SHA tracking,
 * falls back to raw.githubusercontent.com for public repos.
 */
export async function fetchGitHubFile(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  token?: string,
): Promise<GitHubFileContent | null> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // GitHub API requires User-Agent
  headers['User-Agent'] = 'SkillSpace-Registry';

  // Try the Contents API first (gives us the SHA)
  try {
    const apiUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const apiRes = await fetch(apiUrl, { headers });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.encoding === 'base64') {
        return {
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
          sha: data.sha,
          size: data.size,
        };
      }
    }
  } catch {
    // Fall through to raw URL
  }

  // Fallback: raw.githubusercontent.com (public repos, no SHA)
  try {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
    const res = await fetch(rawUrl, { headers });
    if (!res.ok) return null;

    const content = await res.text();
    return { content, sha: '', size: content.length };
  } catch {
    return null;
  }
}

/**
 * Fetch a package manifest from GitHub and parse it as YAML.
 * Returns the raw content, parsed object, commit SHA, and file size.
 */
export async function fetchPackageFromGitHub(
  input: string,
  token?: string,
): Promise<GitHubPackageManifest | null> {
  const info = parseGitHubUrl(input);
  if (!info) return null;

  const file = await fetchGitHubFile(info.owner, info.repo, info.branch, info.path, token);
  if (!file) return null;

  let parsed: Record<string, unknown>;
  try {
    parsed = yaml.load(file.content) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
  } catch {
    return null;
  }

  return { raw: file.content, parsed, sha: file.sha, size: file.size };
}

/**
 * Get the latest commit SHA for a file via the GitHub API.
 */
export async function getFileCommitSha(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  token?: string,
): Promise<string | null> {
  const headers: Record<string, string> = { 'User-Agent': 'SkillSpace-Registry' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/commits?path=${filePath}&sha=${branch}&per_page=1`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].sha) {
      return data[0].sha as string;
    }
    return null;
  } catch {
    return null;
  }
}
