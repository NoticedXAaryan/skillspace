export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import LandingPageClient from '@/components/LandingPageClient';

async function getCommunityStats() {
  try {
    const [skillsCount, usersCount, downloadsResult] = await Promise.all([
      prisma.package.count(),
      prisma.user.count(),
      prisma.package.aggregate({ _sum: { downloads: true } }),
    ]);
    return {
      skillsCount,
      usersCount,
      downloadsCount: downloadsResult._sum.downloads || 0,
    };
  } catch {
    return { skillsCount: 0, usersCount: 0, downloadsCount: 0 };
  }
}

async function getFeaturedPackages() {
  try {
    const packages = await prisma.package.findMany({
      take: 6,
      orderBy: { downloads: 'desc' },
      include: {
        owner: { select: { username: true } },
        versions: { orderBy: { publishedAt: 'desc' }, take: 1 },
      },
    });
    return packages.map(pkg => ({
      ...pkg,
      tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags,
      latestVersion: pkg.versions[0]?.version,
    }));
  } catch {
    return [];
  }
}

async function getRecentPackages() {
  try {
    const packages = await prisma.package.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { username: true } },
        versions: { orderBy: { publishedAt: 'desc' }, take: 1 },
      },
    });
    return packages.map(pkg => ({
      ...pkg,
      tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags,
      latestVersion: pkg.versions[0]?.version,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stats = await getCommunityStats();
  const packages = await getFeaturedPackages();
  const recentPackages = await getRecentPackages();

  return (
    <main>
      <LandingPageClient
        stats={stats}
        packages={packages}
        recentPackages={recentPackages}
      />
    </main>
  );
}
