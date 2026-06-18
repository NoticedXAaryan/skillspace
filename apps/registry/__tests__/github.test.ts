import { describe, it, expect } from 'vitest';
import { parseGitHubUrl } from '../src/lib/github';

describe('parseGitHubUrl', () => {
  it('parses owner/repo shorthand', () => {
    const result = parseGitHubUrl('alice/my-skill');
    expect(result).toEqual({
      owner: 'alice',
      repo: 'my-skill',
      branch: 'main',
      path: 'skill.yaml',
    });
  });

  it('parses owner/repo/path shorthand', () => {
    const result = parseGitHubUrl('alice/my-skill/skills/review.yaml');
    expect(result?.path).toBe('skills/review.yaml');
  });

  it('parses full GitHub tree URL', () => {
    const result = parseGitHubUrl(
      'https://github.com/alice/my-skill/tree/develop/skills/review.yaml',
    );
    expect(result).toEqual({
      owner: 'alice',
      repo: 'my-skill',
      branch: 'develop',
      path: 'skills/review.yaml',
    });
  });

  it('returns null for invalid input', () => {
    expect(parseGitHubUrl('not-a-url')).toBeNull();
    expect(parseGitHubUrl('https://gitlab.com/alice/repo')).toBeNull();
  });
});
