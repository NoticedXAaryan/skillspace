export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Trophy, Sparkles, Star, Package, Award } from 'lucide-react';
import Link from 'next/link';
import { HeroSection } from '@/components/ui/hero-odyssey';
import { Card, CardContent } from '@/components/ui/card';


export const metadata = {
  title: 'Contributors — SkillSpace',
  description: 'Top contributors to the SkillSpace ecosystem.',
};

export default async function ContributorsPage() {
  // In a real scenario, we would aggregate downloads or stars.
  // We'll fetch top users by package count for now.
  const topUsers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      packages: {
        _count: 'desc'
      }
    },
    include: {
      _count: {
        select: { packages: true, followers: true }
      }
    }
  });

  const displayUsers = topUsers.map(u => ({
    username: u.username,
    bio: u.bio,
    packages: u._count.packages,
    followers: u._count.followers
  }));

  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection 
        title="Contributor Leaderboard"
        subtitle="Recognizing the developers building the open AI ecosystem."
        align="center"
        badge={{ text: "Community" }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10 -mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
          
          {/* Main Content */}
          <div className="flex flex-col gap-10">
            {/* Hall of Fame */}
            <section>
              <div className="flex items-center gap-2 mb-6 border-b border-amber-500/20 pb-3">
                <Award className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-bold text-amber-500">Hall of Fame</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1),transparent_50%)]" />
                  <CardContent className="p-8 flex flex-col items-center text-center relative z-10">
                    <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-3xl font-bold text-black mb-4 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                      A
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">@alice-ai</h3>
                    <p className="text-amber-500 font-bold text-sm mb-4">Contributor of the Month</p>
                    <p className="text-sm text-neutral-400">Recognized for building the core vision processing pipeline.</p>
                  </CardContent>
                </Card>

                <Card className="bg-neutral-950 border-white/10 group">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-neutral-900 border-2 border-white/10 flex items-center justify-center text-3xl font-bold text-neutral-600 mb-4 group-hover:border-white/20 transition-colors">
                      B
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">@bob-builder</h3>
                    <p className="text-neutral-400 font-medium text-sm mb-4">Community MVP (May 2026)</p>
                    <p className="text-sm text-neutral-400">Resolved over 50 community issues in the LangChain integration.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
                <Trophy className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">All-Time Leaderboard</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                {displayUsers.map((user, index) => (
                  <div key={user.username} className="flex items-center gap-4 bg-neutral-950/50 hover:bg-neutral-900/80 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 transition-all duration-300">
                    <div className="w-8 text-center font-mono font-bold text-neutral-500 text-lg">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-white shrink-0">
                      {user.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${user.username || ''}`} className="text-base font-bold text-white hover:text-cyan-400 transition-colors truncate block">
                        @{user.username || 'unknown'}
                      </Link>
                      <p className="text-sm text-neutral-500 truncate">{user.bio || 'Open source contributor'}</p>
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
            </section>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <Card className="bg-neutral-950 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_70%)]" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-white">Rising Stars</h3>
                </div>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                     <Link href="/profile/new-dev" className="text-sm font-medium text-neutral-300 hover:text-cyan-400 transition-colors">@new-dev</Link>
                     <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+450%</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <Link href="/profile/creative-ai" className="text-sm font-medium text-neutral-300 hover:text-cyan-400 transition-colors">@creative-ai</Link>
                     <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">+320%</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </aside>

        </div>
      </div>
    </main>
  );
}
