import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const type = url.searchParams.get('type') || undefined;
  const sort = url.searchParams.get('sort') || 'downloads';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));

  if (!query) return error('VALIDATION_ERROR', 'Query parameter "q" is required', 400);

  const skip = (page - 1) * limit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    OR: [{ name: { contains: query } }, { description: { contains: query } }],
  };
  if (type) where.type = type;

  const orderBy =
    sort === 'name' ? { name: 'asc' as const } : { downloads: 'desc' as const };

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        owner: { select: { username: true } },
        versions: { orderBy: { publishedAt: 'desc' }, take: 1 },
      },
    }),
    prisma.package.count({ where }),
  ]);

  return success(
    packages.map((p) => ({
      name: p.name,
      description: p.description,
      type: p.type,
      author: p.owner.username,
      downloads: p.downloads,
      tags: JSON.parse(p.tags),
      latestVersion: p.versions[0]?.version,
      verified: p.verified,
    })),
    { page, limit, total },
  );
}
