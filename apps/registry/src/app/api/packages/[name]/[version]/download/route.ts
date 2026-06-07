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
    const user = getUserFromRequest(_req);
    if (!user) {
      return error('UNAUTHORIZED', 'Unauthorized. This package is private.', 401);
    }
    if (pkg.orgId) {
      const isMember = await prisma.organizationMember.findUnique({
        where: { userId_organizationId: { userId: user.userId, organizationId: pkg.orgId } }
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

  if (!(await packageExists(name, version))) {
    return error('STORAGE_ERROR', 'Package file not found in storage', 500);
  }

  const data = await readPackage(name, version);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}-${version}.skillpkg"`,
      'X-Checksum': pkgVersion.checksum,
    },
  });
}
