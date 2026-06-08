import { PrismaClient } from '@prisma/client';
import SearchClient from './SearchClient';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} — SkillSpace` : 'Search — SkillSpace',
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;

  const packagesRaw = await prisma.package.findMany({
    include: {
      owner: { select: { username: true } },
      versions: { orderBy: { publishedAt: 'desc' }, take: 1 },
      _count: {
        select: { stars: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Limit for demo purposes
  });

  const packages = packagesRaw.map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    type: pkg.type,
    downloads: pkg.downloads,
    isPrivate: pkg.isPrivate,
    verified: pkg.verified,
    latestVersion: pkg.versions[0]?.version || '0.0.0',
    owner: { username: pkg.owner.username },
    _count: pkg._count,
    tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags
  }));

  return <SearchClient initialData={packages} initialQuery={q} />;
}
