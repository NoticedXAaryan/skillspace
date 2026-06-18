export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Trophy, Star, Package } from 'lucide-react';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/hero-odyssey';
import EmptyState from '@/components/EmptyState';

export const metadata = {
  title: 'Contributors — SkillSpace',
  description: 'Top contributors to the SkillSpace ecosystem.',
};

export default async function ContributorsPage() {
  const topUsers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      packages: {
        _count: 'desc',
      },
    },
    include: {
      _count: {
        select: { packages: true, followers: true },
      },
    },
  });

  const displayUsers = topUsers.map((u) => ({
    username: u.username,
    bio: u.bio,
    packages: u._count.packages,
    followers: u._count.followers,
  }));

  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection
        title="Contributor Leaderboard"
        subtitle="Recognizing the developers building the open AI ecosystem."
        align="center"
        badge={{ text: 'Community' }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10 -mt-4">
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
            <Trophy className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">All-Time Leaderboard</h2>
          </div>

          {displayUsers.length === 0 ? (
            <div className="text-white">
              <EmptyState
                title="No contributors yet"
                description="Users with published packages will appear here once the registry has real community activity."
                icon={<Trophy className="h-8 w-8 text-cyan-400" />}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayUsers.map((user, index) => (
                <div
                  key={user.username}
                  className="flex items-center gap-4 bg-neutral-950/50 hover:bg-neutral-900/80 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all duration-300"
                >
                  <div className="w-8 text-center font-mono font-bold text-neutral-500 text-lg">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white shrink-0">
                    {user.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/profile/${user.username || ''}`}
                      className="text-base font-bold text-white hover:text-cyan-400 transition-colors truncate block"
                    >
                      @{user.username || 'unknown'}
                    </Link>
                    <p className="text-sm text-neutral-500 truncate">
                      {user.bio || 'Open source contributor'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 text-sm font-mono text-neutral-400">
                      <Package className="w-4 h-4 text-cyan-500" /> {user.packages}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-mono text-neutral-400">
                      <Star className="w-4 h-4 text-amber-500" /> {user.followers}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
