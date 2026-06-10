export const dynamic = 'force-dynamic';
import { Target, Users, Coins } from 'lucide-react';
import { PrismaClient } from '@prisma/client';
import { HeroSection } from '@/components/ui/hero-odyssey';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Skill Requests — SkillSpace',
  description: 'Community requested capabilities and bounties.',
};

export default async function RequestsPage() {
  const requests = await prisma.skillRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const displayRequests = requests.length > 0 ? requests : [
    { id: '1', title: 'Video to Subtitle Parser', description: 'A skill that takes an MP4 video file, extracts audio, transcribes it using Whisper, and outputs an SRT file.', status: 'open', bounty: '$500', user: { username: 'creator-studio' } },
    { id: '2', title: 'Figma to React Component', description: 'Accepts a Figma URL and node ID, and returns a fully styled React/Tailwind component.', status: 'claimed', bounty: '$1,200', user: { username: 'design-corp' } },
    { id: '3', title: 'Local PDF RAG Query', description: 'Injest a PDF into a local ChromaDB instance and query it without internet access.', status: 'completed', bounty: 'None', user: { username: 'privacy-first' } }
  ];

  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection 
        title="Skill Requests & Bounties"
        subtitle="Can't find what you need? Request a skill. Developers can claim bounties by building requested packages."
        align="center"
        badge={{ text: "Requests" }}
      />
      
      <div className="flex justify-center -mt-8 mb-16 relative z-10">
        <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full px-8 py-6 h-auto text-base">
          New Request
        </Button>
      </div>

      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
          <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-full h-9">All Requests</Button>
          <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-full h-9">Open Bounties</Button>
          <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-full h-9">Claimed</Button>
          <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-full h-9">Completed</Button>
        </div>

        <div className="flex flex-col gap-4">
          {displayRequests.map((req: any) => (
            <Card key={req.id} className="bg-neutral-950 border-white/10 hover:border-cyan-500/30 transition-colors group overflow-hidden">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{req.title}</h2>
                      <Badge 
                        variant="outline" 
                        className={`ml-4 shrink-0
                          ${req.status === 'open' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                            req.status === 'claimed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                      >
                        {req.status === 'open' ? 'Open' : req.status === 'claimed' ? 'In Progress' : 'Completed'}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-6">{req.description}</p>
                  </div>
                  <div className="flex items-center text-xs text-neutral-500">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    <span>@{req.user?.username}</span>
                  </div>
                </div>
                
                <div className="bg-black/50 p-6 sm:w-64 border-t sm:border-t-0 sm:border-l border-white/10 flex flex-row sm:flex-col items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Bounty</span>
                    <span className="flex items-center gap-1.5 text-lg font-mono font-bold text-white">
                      <Coins className="w-4 h-4 text-yellow-500" /> 
                      {req.bounty || 'Open Source'}
                    </span>
                  </div>
                  <Button 
                    variant={req.status === 'open' ? 'default' : 'secondary'}
                    disabled={req.status !== 'open'}
                    className={`w-full sm:w-auto ${req.status === 'open' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-white/5 text-neutral-400 border border-white/10'}`}
                  >
                    {req.status === 'open' ? 'Claim Request' : 'View Details'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
