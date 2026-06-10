import { Trophy, Calendar, Users, Target, ArrowRight } from 'lucide-react';
import { HeroSection } from '@/components/ui/hero-odyssey';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Hackathons & Challenges — SkillSpace',
  description: 'Participate in community challenges and monthly skill competitions.',
};

export default function HackathonsPage() {
  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection 
        title="Hackathons & Challenges"
        subtitle="Build the future of open source AI. Compete in monthly challenges, earn bounties, and climb the global leaderboard."
        align="center"
        badge={{ text: "Events" }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Active Challenge */}
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xl font-bold text-white">Active Monthly Challenge</h2>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Now</span>
              </div>
            </div>

            <Card className="bg-neutral-950 border-cyan-500/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.1),transparent_50%)]" />
              <CardContent className="p-8 flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex flex-col flex-1">
                  <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-3">June 2026</div>
                  <h3 className="text-3xl font-bold text-white mb-4">The Autonomous Agents Hackathon</h3>
                  <p className="text-neutral-400 mb-8 max-w-lg leading-relaxed">Build a fully autonomous agent using the SkillSpace Runtime that can accomplish a complex multi-step workflow without human intervention.</p>
                  
                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                      <Trophy className="w-4 h-4" /> 
                      <span className="font-bold text-sm">$5,000 Prize Pool</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <Calendar className="w-4 h-4" /> 
                      <span className="font-bold text-sm">Ends in 12 Days</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                      <Users className="w-4 h-4" /> 
                      <span className="font-bold text-sm">432 Participants</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-auto">
                    <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold">Join Challenge</Button>
                    <Button variant="secondary" className="bg-white/5 text-white hover:bg-white/10 border border-white/10">View Rules</Button>
                  </div>
                </div>
                <div className="hidden md:block w-48 shrink-0 relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
                  <div className="w-full h-full border border-cyan-500/50 rounded-xl bg-black/50 backdrop-blur-sm relative flex items-center justify-center">
                    <Trophy className="w-20 h-20 text-cyan-400 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Past Winners */}
            <div className="mt-8">
              <div className="flex items-center border-b border-white/10 pb-3 mb-6">
                <h2 className="text-xl font-bold text-white">Past Winners</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { month: 'May 2026', title: 'Data Pipeline Masters', winner: 'data-smith', prize: '$3,000' },
                  { month: 'April 2026', title: 'Generative UI Challenge', winner: 'design-corp', prize: '$2,500' },
                  { month: 'March 2026', title: 'Local Models Hack', winner: 'privacy-first', prize: '$4,000' },
                ].map(past => (
                  <Card key={past.month} className="bg-neutral-950 border-white/10">
                    <CardContent className="p-6">
                      <div className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-widest mb-2">{past.month}</div>
                      <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{past.title}</h3>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex justify-between items-center text-neutral-400">
                          <span>Winner</span>
                          <span className="font-bold text-cyan-400">@{past.winner}</span>
                        </div>
                        <div className="flex justify-between items-center text-neutral-400">
                          <span>Prize</span>
                          <span className="font-bold text-amber-500">{past.prize}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <Card className="bg-neutral-950 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-white">Global Leaderboard</h3>
                </div>
                <p className="text-sm text-neutral-500 mb-6">Top builders this season</p>
                
                <div className="flex flex-col gap-3 mb-6">
                  {[
                    { name: 'alice-ai', score: 2450 },
                    { name: 'bob-builder', score: 2100 },
                    { name: 'charlie-dev', score: 1850 },
                    { name: 'data-wizard', score: 1600 },
                    { name: 'eve-hacker', score: 1420 },
                  ].map((user, i) => (
                    <div key={user.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold text-sm ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-400' : 'text-neutral-600'}`}>#{i + 1}</span>
                        <span className="text-sm font-medium text-neutral-300 group-hover:text-cyan-400 transition-colors">@{user.name}</span>
                      </div>
                      <span className="text-sm font-mono text-cyan-500">{user.score}</span>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" className="w-full text-neutral-400 hover:text-white justify-between">
                  View Full Rankings <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-neutral-950 border-white/10">
              <CardContent className="p-6">
                <h3 className="font-bold text-white mb-6">Upcoming Events</h3>
                <div className="flex flex-col gap-4">
                  {[
                    { date: 'July 1-15', title: 'Vision Models Challenge' },
                    { date: 'August 10-12', title: 'SkillSpace 48h Global Hack' }
                  ].map((event, i) => (
                    <div key={i} className="flex flex-col gap-1 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">{event.date}</span>
                      <span className="font-medium text-neutral-300">{event.title}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
