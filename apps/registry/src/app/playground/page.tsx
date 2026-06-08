import prisma from '@/lib/prisma';
import PlaygroundClient from './PlaygroundClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'SkillSpace Playground',
  description: 'Try out public skills instantly in the browser.',
};

export default async function PlaygroundPage() {
  const skills = await prisma.package.findMany({
    where: { isPrivate: false, type: 'skill' },
    select: { name: true, description: true },
    orderBy: { downloads: 'desc' },
  });

  return <PlaygroundClient initialSkills={skills} />;
}
