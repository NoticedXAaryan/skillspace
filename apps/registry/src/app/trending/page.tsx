import { prisma } from '@/lib/prisma';
import TrendingClient from './TrendingClient';

export const metadata = {
  title: 'Trending Skills — SkillSpace',
  description: 'Fastest growing open source AI capabilities.',
};

export const dynamic = 'force-dynamic';

async function getTrendingPackages() {
  const now = new Date();

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);

  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);

  const packagesRaw = await prisma.package.findMany({
    include: { owner: { select: { username: true } }, _count: { select: { stars: true } } },
  });

  const scoredPackages = packagesRaw.map((p) => {
    const score = p.downloads * 10 + p._count.stars * 50;
    return {
      id: p.id,
      name: p.name,
      author: p.owner?.username || 'skillspace',
      downloads: p.downloads,
      stars: p._count.stars,
      score,
      createdAt: p.createdAt,
    };
  });

  const filterAndSort = (fromDate: Date) =>
    scoredPackages
      .filter((p) => p.createdAt >= fromDate)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

  return {
    today: filterAndSort(today),
    week: filterAndSort(lastWeek),
    month: filterAndSort(lastMonth),
    allTime: [...scoredPackages].sort((a, b) => b.score - a.score).slice(0, 10),
  };
}

export default async function TrendingPage() {
  const data = await getTrendingPackages();
  return <TrendingClient data={data} />;
}
