import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized } from '@/lib/api-response';
import { verifyGitHubRepo, fetchGitHubFile, parseGitHubUrl } from '@/lib/github';

const LinkGitHubSchema = z.object({
  packageName: z.string().min(1),
  githubUrl: z.string().url(),
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

  // Verify the GitHub repo
  const verification = await verifyGitHubRepo(githubUrl);
  if (!verification.valid) {
    return error('VALIDATION_ERROR', verification.error || 'GitHub verification failed', 400);
  }

  // Fetch the skill.yaml content
  const info = parseGitHubUrl(githubUrl);
  if (!info) return error('VALIDATION_ERROR', 'Invalid GitHub URL', 400);

  const skillFile = await fetchGitHubFile(info.owner, info.repo, branch, path);
  if (!skillFile) {
    return error('VALIDATION_ERROR', `Could not fetch ${path} from the repository`, 400);
  }

  // Update the package with GitHub info
  const updated = await prisma.package.update({
    where: { id: pkg.id },
    data: {
      githubUrl,
      githubBranch: branch,
      githubPath: path,
      verifiedBy: 'github',
      verifiedAt: new Date(),
    },
  });

  // If the package has no versions yet, create one from the fetched manifest
  const existingVersions = await prisma.packageVersion.findMany({
    where: { packageId: pkg.id },
  });

  if (existingVersions.length === 0) {
    // Parse the YAML to extract version
    const versionMatch = skillFile.content.match(/version:\s*["']?([^"'\s]+)["']?/);
    const version = versionMatch ? versionMatch[1] : '1.0.0';

    await prisma.packageVersion.create({
      data: {
        packageId: pkg.id,
        version,
        manifest: skillFile.content,
        storagePath: `github:${githubUrl}`,
        checksum: skillFile.sha || 'github-linked',
        size: skillFile.size,
        githubCommit: skillFile.sha || null,
      },
    });
  }

  return success({
    package: updated.name,
    githubUrl: updated.githubUrl,
    branch: updated.githubBranch,
    verified: true,
  });
}
