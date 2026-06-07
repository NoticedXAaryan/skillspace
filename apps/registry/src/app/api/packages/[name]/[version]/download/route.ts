import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notFound, error } from '@/lib/api-response';
import { readPackage, packageExists } from '@/lib/storage';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string; version: string }> },
) {
  const { name, version } = await params;
  const pkg = await prisma.package.findUnique({ where: { name } });
  if (!pkg) return notFound(`Package "${name}" not found`);

  const pkgVersion = await prisma.packageVersion.findFirst({
    where: { packageId: pkg.id, version },
  });
  if (!pkgVersion) return notFound(`Version "${version}" not found`);

  if (!packageExists(name, version)) {
    return error('STORAGE_ERROR', 'Package file not found in storage', 500);
  }

  const data = readPackage(name, version);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}-${version}.skillpkg"`,
      'X-Checksum': pkgVersion.checksum,
    },
  });
}
