import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardPlaygroundClient from './DashboardPlaygroundClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Playground — SkillSpace Dashboard',
  description: 'Test your skills interactively in the browser.',
};

export default async function DashboardPlaygroundPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const skills = await prisma.package.findMany({
    where: { isPrivate: false, type: 'skill' },
    select: { name: true, description: true },
    orderBy: { downloads: 'desc' },
  });

  const userSkills = await prisma.package.findMany({
    where: { ownerId: session.user.id, type: 'skill' },
    select: { name: true, description: true },
    orderBy: { createdAt: 'desc' },
  });

  return <DashboardPlaygroundClient initialSkills={skills} userSkills={userSkills} />;
}
