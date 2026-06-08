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

  // For a real trending algorithm, we would query ExecutionLog counts over the timeframe.
  // Since we don't have enough granular historical execution data seeded, we will filter
  // by `createdAt` or just use `downloads` descending as a proxy to show real data.
  
  const [todayPkgs, weekPkgs, monthPkgs, allTimePkgs] = await Promise.all([
    prisma.package.findMany({
      where: { createdAt: { gte: today } },
      orderBy: { downloads: 'desc' },
      take: 10,
      include: { owner: { select: { username: true } }, _count: { select: { stars: true } } }
    }),
    prisma.package.findMany({
      where: { createdAt: { gte: lastWeek } },
      orderBy: { downloads: 'desc' },
      take: 10,
      include: { owner: { select: { username: true } }, _count: { select: { stars: true } } }
    }),
    prisma.package.findMany({
      where: { createdAt: { gte: lastMonth } },
      orderBy: { downloads: 'desc' },
      take: 10,
      include: { owner: { select: { username: true } }, _count: { select: { stars: true } } }
    }),
    prisma.package.findMany({
      orderBy: { downloads: 'desc' },
      take: 10,
      include: { owner: { select: { username: true } }, _count: { select: { stars: true } } }
    })
  ]);

  const mapPkg = (p: any) => ({
    id: p.id,
    name: p.name,
    author: p.owner.username,
    downloads: p.downloads,
    stars: p._count.stars
  });

  // If no packages were created today/week/month (due to seed data), fallback to all time to prevent empty screens
  return {
    today: todayPkgs.length > 0 ? todayPkgs.map(mapPkg) : allTimePkgs.map(mapPkg),
    week: weekPkgs.length > 0 ? weekPkgs.map(mapPkg) : allTimePkgs.map(mapPkg),
    month: monthPkgs.length > 0 ? monthPkgs.map(mapPkg) : allTimePkgs.map(mapPkg),
    allTime: allTimePkgs.map(mapPkg)
  };
}

export default async function TrendingPage() {
  const data = await getTrendingPackages();
  return <TrendingClient data={data} />;
}
