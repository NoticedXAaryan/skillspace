import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import KeysClient from './KeysClient';

export const metadata = {
  title: 'API Keys — SkillSpace',
  description: 'Manage your AI model API keys.',
};

export default async function KeysPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <KeysClient
      settings={{
        openaiKey: !!settings?.openaiKey,
        anthropicKey: !!settings?.anthropicKey,
        googleKey: !!settings?.googleKey,
        ollamaUrl: settings?.ollamaUrl || '',
        defaultModel: settings?.defaultModel || '',
      }}
    />
  );
}
