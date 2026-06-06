import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, notFound } from '@/lib/api-response';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const pkg = await prisma.package.findUnique({
    where: { name },
    include: { versions: { orderBy: { publishedAt: 'desc' } } },
  });

  if (!pkg) return notFound(`Package "${name}" not found`);

  return success(
    pkg.versions.map((v) => ({
      version: v.version,
      checksum: v.checksum,
      deprecated: v.deprecated,
      publishedAt: v.publishedAt,
      manifest: JSON.parse(v.manifest),
    })),
  );
}
