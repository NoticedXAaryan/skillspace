/**
 * GitHub API integration for SkillSpace.
 * Fetches skill.yaml content from public GitHub repos.
 */

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

/**
 * Parse a GitHub URL into owner/repo/branch/path components.
 * Supports formats:
 *   - https://github.com/owner/repo
 *   - https://github.com/owner/repo/tree/main/path/to/skill.yaml
 *   - https://github.com/owner/repo/blob/main/path/to/skill.yaml
 */
export function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;

    const owner = parts[0];
    const repo = parts[1];

    // Check for branch and path in tree/blob URLs
    let branch = 'main';
    let path = '';

    if (parts.length >= 4 && (parts[2] === 'tree' || parts[2] === 'blob')) {
      branch = parts[3] || 'main';
      path = parts.slice(4).join('/');
    }

    return { owner, repo, branch, path };
  } catch {
    return null;
  }
}

/**
 * Fetch a file from a GitHub repository.
 * Uses the GitHub API for private repos, or raw.githubusercontent.com for public repos.
 */
export async function fetchGitHubFile(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  token?: string,
): Promise<GitHubFileContent | null> {
  // Try raw.githubusercontent.com first (no auth needed for public repos)
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(rawUrl, { headers });
    if (!res.ok) {
      // Try GitHub API as fallback
      const apiUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
      const apiRes = await fetch(apiUrl, { headers });

      if (!apiRes.ok) return null;

      const data = await apiRes.json();
      if (data.encoding === 'base64') {
        return {
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
          sha: data.sha,
          size: data.size,
        };
      }
      return null;
    }

    const content = await res.text();
    return { content, sha: '', size: content.length };
  } catch {
    return null;
  }
}

/**
 * Verify that a GitHub repo contains a valid skill.yaml.
 */
export async function verifyGitHubRepo(
  url: string,
  token?: string,
): Promise<{ valid: boolean; manifest?: Record<string, unknown>; error?: string }> {
  const info = parseGitHubUrl(url);
  if (!info) {
    return { valid: false, error: 'Invalid GitHub URL format' };
  }

  // If no path specified, look for skill.yaml in the root
  const skillPath = info.path || 'skill.yaml';
  const file = await fetchGitHubFile(info.owner, info.repo, info.branch, skillPath, token);

  if (!file) {
    return { valid: false, error: `Could not find ${skillPath} in ${info.owner}/${info.repo}` };
  }

  try {
    // Basic YAML parsing (check for required fields)
    const lines = file.content.split('\n');
    const hasName = lines.some(l => l.startsWith('name:'));
    const hasVersion = lines.some(l => l.startsWith('version:'));
    const hasSchemaVersion = lines.some(l => l.includes('schemaVersion:') || l.includes('schema_version:'));

    if (!hasName || !hasVersion) {
      return { valid: false, error: 'skill.yaml is missing required fields (name, version)' };
    }

    return { valid: true, manifest: { sha: file.sha, size: file.size } };
  } catch {
    return { valid: false, error: 'Failed to parse skill.yaml' };
  }
}
