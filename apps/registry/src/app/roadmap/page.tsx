export const dynamic = 'force-dynamic';
import { Map, CheckCircle2, CircleDashed, ArrowRightCircle, ThumbsUp } from 'lucide-react';
import { PrismaClient } from '@prisma/client';
import { HeroSection } from '@/components/ui/hero-odyssey';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Roadmap — SkillSpace',
  description: 'Public feature roadmap and voting.',
};

export default async function RoadmapPage() {
  const items = await prisma.roadmapItem.findMany({
    include: {
      _count: { select: { votes: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const displayItems = items.length > 0 ? items : [
    { id: '1', title: 'Support for Gemini 2.0 Pro', description: 'Update the core runtime to natively support the newest Gemini models with full multimodal streaming.', status: 'in_progress', _count: { votes: 142 } },
    { id: '2', title: 'Python SDK', description: 'Create a pip-installable python SDK to interact with the SkillSpace engine from backend microservices.', status: 'planned', _count: { votes: 89 } },
    { id: '3', title: 'Organization Workspaces', description: 'Allow teams to group their private packages and manage access control lists.', status: 'planned', _count: { votes: 65 } },
    { id: '4', title: 'Agent Sandbox 2.0', description: 'Secure gVisor integration for the background execution of arbitrary untrusted packages.', status: 'completed', _count: { votes: 215 } }
  ];

  const planned = displayItems.filter(i => i.status === 'planned');
  const inProgress = displayItems.filter(i => i.status === 'in_progress');
  const completed = displayItems.filter(i => i.status === 'completed');

  const Column = ({ title, icon: Icon, items, color, borderColor }: { title: string, icon: any, items: any[], color: string, borderColor: string }) => (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center gap-2 pb-3 border-b border-white/10 ${borderColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="text-lg font-bold text-white">{title} ({items.length})</h2>
      </div>
      
      <div className="flex flex-col gap-4 mt-2">
        {items.map(item => (
          <Card key={item.id} className="bg-neutral-950 border-white/10 hover:border-cyan-500/30 transition-colors group">
            <CardContent className="p-4 flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <button className="text-neutral-500 hover:text-cyan-400 hover:bg-cyan-500/10 p-2 rounded-md transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-cyan-400 transition-colors">{item._count.votes}</span>
              </div>
              
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-base mb-1 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection 
        title="Public Roadmap"
        subtitle="Help shape the future of SkillSpace. Vote on features or submit new ideas."
        align="center"
        badge={{ text: "Roadmap" }}
      />
      
      <div className="flex justify-center -mt-8 mb-16 relative z-10">
        <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full px-8 py-6 h-auto text-base">
          Submit Feature Request
        </Button>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
          <Column title="Planned" icon={CircleDashed} items={planned} color="text-neutral-500" borderColor="border-b-neutral-500" />
          <Column title="In Progress" icon={ArrowRightCircle} items={inProgress} color="text-cyan-400" borderColor="border-b-cyan-400" />
          <Column title="Completed" icon={CheckCircle2} items={completed} color="text-emerald-500" borderColor="border-b-emerald-500" />
        </div>
      </div>
    </main>
  );
}
