import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Settings — SkillSpace',
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, username: true, plan: true },
  });

  if (!user) redirect('/');

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <SettingsClient
      user={user}
      settings={settings ? {
        openaiKey: settings.openaiKey ? true : false,
        anthropicKey: settings.anthropicKey ? true : false,
        googleKey: settings.googleKey ? true : false,
        ollamaUrl: settings.ollamaUrl || '',
        defaultModel: settings.defaultModel || '',
      } : {
        openaiKey: false,
        anthropicKey: false,
        googleKey: false,
        ollamaUrl: '',
        defaultModel: '',
      }}
    />
  );
}
