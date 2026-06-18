import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized } from '@/lib/api-response';
import { checkRateLimit } from '@/lib/rate-limit';
import { fetchPackageFromGitHub, parseGitHubUrl, getFileCommitSha } from '@/lib/github';
import semver from 'semver';

const GitHubPublishSchema = z.object({
  githubUrl: z.string().min(1),
  name: z
    .string()
    .min(1)
    .regex(/^(@[a-z0-9-]+\/)?[a-z][a-z0-9]*(-[a-z0-9]+)*$/)
    .optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .optional(),
  description: z.string().max(200).optional(),
  isPrivate: z.boolean().optional().default(false),
});

/**
 * POST /api/packages/github
 * Publish a package by importing its manifest from GitHub.
 * The manifest is fetched, validated, and stored — no file upload required.
 */
export async function POST(req: NextRequest) {
  const rl = checkRateLimit(req, 15, 60);
  if (!rl.success) return error('TOO_MANY_REQUESTS', 'Rate limit exceeded. Try again later.', 429);

  const auth = await getUserFromRequest(req);
  if (!auth) return unauthorized();

  try {
    const body = await req.json().catch(() => null);
    if (!body) return error('VALIDATION_ERROR', 'Request body is required', 400);

    const parsed = GitHubPublishSchema.safeParse(body);
    if (!parsed.success) {
      return error('VALIDATION_ERROR', 'Invalid input', 400, parsed.error.flatten());
    }

    const { githubUrl } = parsed.data;

    // Parse and validate the GitHub URL
    const info = parseGitHubUrl(githubUrl);
    if (!info) {
      return error(
        'VALIDATION_ERROR',
        'Invalid GitHub URL format. Use owner/repo, owner/repo/path, or a full GitHub URL',
        400,
      );
    }

    // Fetch and parse the manifest
    const manifest = await fetchPackageFromGitHub(githubUrl);
    if (!manifest) {
      return error(
        'VALIDATION_ERROR',
        `Could not fetch or parse manifest from GitHub. Ensure the file at "${info.path}" exists in ${info.owner}/${info.repo}`,
        400,
      );
    }

    // Extract fields from the manifest, allow CLI/body overrides
    const m = manifest.parsed;
    const name = parsed.data.name || (m.name as string);
    const version = parsed.data.version || (m.version as string);
    const description = parsed.data.description || (m.description as string);
    const type = (m.type as string) || 'skill';

    // Validate required fields
    if (!name || typeof name !== 'string') {
      return error(
        'VALIDATION_ERROR',
        'Package name is required — set it in the manifest or pass it in the request',
        400,
      );
    }
    if (!version || !semver.valid(version)) {
      return error(
        'VALIDATION_ERROR',
        `Invalid semantic version: "${version || 'missing'}" — set it in the manifest or pass it in the request`,
        400,
      );
    }
    if (!description) {
      return error(
        'VALIDATION_ERROR',
        'Package description is required — set it in the manifest or pass it in the request',
        400,
      );
    }

    // Security scanning for skill type
    if (type === 'skill' && m.persona) {
      const { scanPersona } = await import('@skillspace/runtime');
      const persona = m.persona as Record<string, unknown>;
      const scan = scanPersona({
        system_prompt: (persona.system_prompt as string) || '',
        behavioral_guidelines: (persona.behavioral_guidelines as string[]) || [],
      });

      if (scan.status === 'BLOCKED') {
        return error(
          'SECURITY_BLOCKED',
          'Package blocked: Critical prompt injection patterns detected in persona',
          403,
          scan.findings,
        );
      }
    }

    // Handle scope and naming
    let scope: string | null = null;
    let packageName = name;
    let orgId: string | null = null;

    if (name.startsWith('@')) {
      const parts = name.substring(1).split('/');
      scope = parts[0];
      packageName = parts[1];

      const user = await prisma.user.findUnique({ where: { id: auth.userId } });
      if (user?.username !== scope) {
        const org = await prisma.organization.findUnique({
          where: { slug: scope },
          include: { members: true },
        });
        if (!org) return error('NOT_FOUND', `Organization @${scope} does not exist`, 404);
        const isMember = org.members.some((m) => m.userId === auth.userId);
        if (!isMember) return error('FORBIDDEN', `You are not a member of @${scope}`, 403);
        orgId = org.id;
      }
    } else {
      return error('VALIDATION_ERROR', 'All packages must be scoped (e.g. @yourname/package)', 400);
    }

    // Parse tags from manifest
    const tags = Array.isArray(m.tags) ? m.tags.map(String) : [];

    // Upsert package
    let pkg = await prisma.package.findUnique({ where: { name } });
    if (!pkg) {
      pkg = await prisma.package.create({
        data: {
          name,
          scope,
          orgId,
          type,
          ownerId: auth.userId,
          description,
          isPrivate: parsed.data.isPrivate,
          tags: JSON.stringify(tags),
          githubUrl: `https://github.com/${info.owner}/${info.repo}`,
          githubBranch: info.branch,
          githubPath: info.path,
          verified: true,
          verifiedBy: 'github',
          verifiedAt: new Date(),
        },
      });
    } else {
      if (pkg.ownerId !== auth.userId) {
        return error('FORBIDDEN', 'You do not own this package', 403);
      }
      // Update GitHub source info
      await prisma.package.update({
        where: { id: pkg.id },
        data: {
          githubUrl: `https://github.com/${info.owner}/${info.repo}`,
          githubBranch: info.branch,
          githubPath: info.path,
          verified: true,
          verifiedBy: 'github',
          verifiedAt: new Date(),
        },
      });
    }

    // Check for existing version
    const existingVersion = await prisma.packageVersion.findFirst({
      where: { packageId: pkg.id, version },
    });
    if (existingVersion) {
      return error('CONFLICT', `Version ${version} already exists`, 409);
    }

    // Get the commit SHA for this file
    const commitSha =
      manifest.sha ||
      (await getFileCommitSha(info.owner, info.repo, info.branch, info.path)) ||
      null;

    // Create version — storagePath references GitHub, no blob needed
    const pkgVersion = await prisma.packageVersion.create({
      data: {
        packageId: pkg.id,
        version,
        manifest: manifest.raw,
        storagePath: `github:${info.owner}/${info.repo}/${info.branch}/${info.path}`,
        checksum: commitSha ? `sha256:${commitSha}` : 'github-import',
        size: manifest.size,
        githubCommit: commitSha,
      },
    });

    // Update package metadata
    await prisma.package.update({
      where: { id: pkg.id },
      data: { description, tags: JSON.stringify(tags) },
    });

    return success({
      package: pkg.name,
      version: pkgVersion.version,
      source: 'github',
      githubUrl: `https://github.com/${info.owner}/${info.repo}`,
      commitSha,
    });
  } catch (err) {
    console.error('GitHub publish error:', err);
    return error('INTERNAL_ERROR', 'Failed to publish package from GitHub', 500);
  }
}
