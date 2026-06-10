import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'AIR Developer Console',
  description: 'Manage your Autonomous Intelligence Registry entities.',
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      packages: {
        orderBy: { createdAt: 'desc' },
      }
    }
  });

  if (!user) {
    redirect('/');
  }

  const storageUsed = Number(user.storageUsed || 0);
  const storageQuota = Number(user.storageQuota || 10 * 1024 * 1024 * 1024);

  const data = {
    user: {
      name: user.name,
      email: user.email,
      storageUsed,
      storageQuota
    },
    entities: user.packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      version: pkg.latestVersion || '1.0.0',
      type: (pkg.type || 'skill') as 'skill' | 'agent' | 'mcp',
      downloads: pkg.downloads || 0,
      stars: 0, // Stars aren't in schema yet
    }))
  };

  return <DashboardClient data={data} />;
}
