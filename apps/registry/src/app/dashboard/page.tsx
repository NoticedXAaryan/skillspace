import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Maintainer Dashboard — SkillSpace',
  description: 'Manage your open source skills.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ user?: string }>
}) {
  const { user } = await searchParams;
  
  // If no user specified, grab the first user in the database as a mock logged-in state
  let targetUser = user;
  if (!targetUser) {
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      return <div style={{ padding: '4rem', textAlign: 'center' }}>No users found in database. Please run seed script.</div>;
    }
    // Redirect to append the query param for clarity
    redirect(`/dashboard?user=${defaultUser.username}`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { username: targetUser },
    include: {
      packages: {
        include: {
          versions: {
            orderBy: { publishedAt: 'desc' },
            take: 1
          },
          _count: {
            select: { stars: true }
          }
        }
      }
    }
  });

  if (!dbUser) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>User not found.</div>;
  }

  const data = {
    user: { username: dbUser.username },
    packages: dbUser.packages.map(p => ({
      id: p.id,
      name: p.name,
      version: p.versions.length > 0 ? p.versions[0].version : '0.0.0',
      downloads: p.downloads,
      stars: p._count.stars,
      publishedAt: p.versions.length > 0 ? p.versions[0].publishedAt : p.createdAt,
    }))
  };

  return <DashboardClient data={data} />;
}
