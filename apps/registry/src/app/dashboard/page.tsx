import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const metadata = {
  title: 'AIR Developer Console',
  description: 'Manage your Autonomous Intelligence Registry entities.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (e) {
    // If DB is offline, we'll mock the session for UI development purposes
    console.warn("Database offline, mocking session for UI dev.");
  }

  // If no real session and we are strictly enforcing, we'd redirect.
  // For now, we mock the session if it's missing so the UI is visible for development.
  const user = session?.user || {
    name: 'Ada Lovelace',
    email: 'ada@example.com'
  };

  const data = {
    user: {
      name: user.name,
      email: user.email,
    },
    entities: [
      {
        id: '1',
        name: '@air/web-architect',
        version: '1.0.0',
        type: 'skill' as const,
        downloads: 12400,
        stars: 342,
      },
      {
        id: '2',
        name: '@air/git-agent',
        version: '0.9.5',
        type: 'agent' as const,
        downloads: 8300,
        stars: 120,
      },
      {
        id: '3',
        name: '@air/github-mcp',
        version: '2.1.0',
        type: 'mcp' as const,
        downloads: 45000,
        stars: 890,
      }
    ]
  };

  return <DashboardClient data={data} />;
}
