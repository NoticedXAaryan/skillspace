import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ActivityFeedClient from './ActivityFeedClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Activity — SkillSpace Dashboard',
  description: 'Recent activity from your CLI sessions.',
};

export default async function ActivityPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const executions = await prisma.executionLog.findMany({
    where: { userId: session.user.id },
    include: {
      package: {
        select: { name: true, type: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return <ActivityFeedClient executions={executions} />;
}
