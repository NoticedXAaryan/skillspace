import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, notFound } from '@/lib/api-response';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const pkg = await prisma.package.findUnique({
    where: { name },
    include: {
      owner: { select: { id: true, username: true } },
      versions: { orderBy: { publishedAt: 'desc' }, take: 1 },
    },
  });

  if (!pkg) return notFound(`Package "${name}" not found`);

  await prisma.package.update({ where: { id: pkg.id }, data: { downloads: { increment: 1 } } });

  return success({
    ...pkg,
    tags: JSON.parse(pkg.tags),
    latestVersion: pkg.versions[0]
      ? { ...pkg.versions[0], manifest: JSON.parse(pkg.versions[0].manifest) }
      : null,
  });
}
