import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized } from '@/lib/api-response';
import { parseGitHubUrl, fetchPackageFromGitHub } from '@/lib/github';

const LinkGitHubSchema = z.object({
  packageName: z.string().min(1),
  githubUrl: z.string().min(1),
  branch: z.string().default('main'),
  path: z.string().default('skill.yaml'),
});

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = LinkGitHubSchema.safeParse(body);
  if (!parsed.success) {
    return error('VALIDATION_ERROR', 'Invalid input', 400, parsed.error.flatten());
  }

  const { packageName, githubUrl, branch, path } = parsed.data;

  // Find the package
  const pkg = await prisma.package.findUnique({ where: { name: packageName } });
  if (!pkg) return error('NOT_FOUND', `Package "${packageName}" not found`, 404);
  if (pkg.ownerId !== user.userId) return error('FORBIDDEN', 'You do not own this package', 403);

  // Parse and validate the GitHub URL
  const info = parseGitHubUrl(githubUrl);
  if (!info) {
    return error(
      'VALIDATION_ERROR',
      'Invalid GitHub URL format. Expected: owner/repo, owner/repo/path, or full GitHub URL',
      400,
    );
  }

  // Fetch the manifest to verify it exists and is valid
  const manifest = await fetchPackageFromGitHub(githubUrl);
  if (!manifest) {
    return error('VALIDATION_ERROR', `Could not fetch or parse ${path} from the repository`, 400);
  }

  // Update the package with GitHub info
  const updated = await prisma.package.update({
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

  // If the package has no versions yet, create one from the fetched manifest
  const existingVersions = await prisma.packageVersion.findMany({
    where: { packageId: pkg.id },
  });

  if (existingVersions.length === 0) {
    // Extract version from parsed manifest
    const version = (manifest.parsed.version as string) || '1.0.0';

    await prisma.packageVersion.create({
      data: {
        packageId: pkg.id,
        version,
        manifest: manifest.raw,
        storagePath: `github:${info.owner}/${info.repo}/${info.path}`,
        checksum: manifest.sha ? `sha256:${manifest.sha}` : 'github-linked',
        size: manifest.size,
        githubCommit: manifest.sha || null,
      },
    });
  }

  return success({
    package: updated.name,
    githubUrl: updated.githubUrl,
    branch: updated.githubBranch,
    path: updated.githubPath,
    verified: true,
  });
}
