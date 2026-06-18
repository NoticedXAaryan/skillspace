import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notFound, error } from '@/lib/api-response';
import { readPackage, packageExists } from '@/lib/storage';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string; version: string }> },
) {
  const { name, version } = await params;
  const pkg = await prisma.package.findUnique({ where: { name } });
  if (!pkg) return notFound(`Package "${name}" not found`);

  if (pkg.isPrivate) {
    const user = await getUserFromRequest(_req);
    if (!user) {
      return error('UNAUTHORIZED', 'Unauthorized. This package is private.', 401);
    }
    if (pkg.orgId) {
      const isMember = await prisma.orgMember.findUnique({
        where: { organizationId_userId: { userId: user.userId, organizationId: pkg.orgId } },
      });
      if (!isMember && pkg.ownerId !== user.userId) {
        return error('FORBIDDEN', 'Forbidden', 403);
      }
    } else if (pkg.ownerId !== user.userId) {
      return error('FORBIDDEN', 'Forbidden', 403);
    }
  }

  const pkgVersion = await prisma.packageVersion.findFirst({
    where: { packageId: pkg.id, version },
  });
  if (!pkgVersion) return notFound(`Version "${version}" not found`);

  // GitHub-backed package: fetch manifest and serve as tar.gz
  if (pkg.githubUrl && pkg.githubBranch && pkg.githubPath) {
    const githubMatch = pkg.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!githubMatch) {
      return error('STORAGE_ERROR', 'Invalid GitHub URL on package record', 500);
    }

    const owner = githubMatch[1];
    const repo = githubMatch[2];
    const ref = pkgVersion.githubCommit || pkg.githubBranch;

    const { fetchGitHubFile } = await import('@/lib/github');
    const { buildSkillpkgFromManifest } = await import('@/lib/build-skillpkg');

    const file = await fetchGitHubFile(owner, repo, ref, pkg.githubPath);
    if (!file) {
      return error('STORAGE_ERROR', 'Could not fetch manifest from GitHub', 502);
    }

    const filename = pkg.githubPath.endsWith('agent.yaml')
      ? ('agent.yaml' as const)
      : ('skill.yaml' as const);
    const { buffer, checksum } = await buildSkillpkgFromManifest(file.content, filename);

    await prisma.package.update({
      where: { id: pkg.id },
      data: { downloads: { increment: 1 } },
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${name}-${version}.skillpkg"`,
        'X-Checksum': checksum,
        'X-Source': 'github',
      },
    });
  }

  // Fallback: S3/blob storage
  if (!(await packageExists(name, version))) {
    return error('STORAGE_ERROR', 'Package file not found in storage', 500);
  }

  await prisma.package.update({
    where: { id: pkg.id },
    data: { downloads: { increment: 1 } },
  });

  const data = await readPackage(name, version);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}-${version}.skillpkg"`,
      'X-Checksum': pkgVersion.checksum,
    },
  });
}
