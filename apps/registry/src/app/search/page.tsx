import { prisma } from '@/lib/prisma';
import SearchClient from './SearchClient';

export const dynamic = 'force-dynamic';

function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === 'string');
  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((tag): tag is string => typeof tag === 'string') : [];
  } catch {
    return [];
  }
}

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
    take: 100
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
    tags: parseTags(pkg.tags)
  }));

  return <SearchClient initialData={packages} initialQuery={q} />;
}
