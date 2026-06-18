export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Map, CheckCircle2, CircleDashed, ArrowRightCircle, ThumbsUp } from 'lucide-react';
import { HeroSection } from '@/components/ui/hero-odyssey';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EmptyState from '@/components/EmptyState';

export const metadata = {
  title: 'Roadmap — SkillSpace',
  description: 'Public feature roadmap and voting.',
};

export default async function RoadmapPage() {
  const items = await prisma.roadmapItem.findMany({
    include: {
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const planned = items.filter((i) => i.status === 'planned');
  const inProgress = items.filter((i) => i.status === 'in_progress');
  const completed = items.filter((i) => i.status === 'completed');

  const Column = ({
    title,
    icon: Icon,
    items,
    color,
    borderColor,
  }: {
    title: string;
    icon: any;
    items: any[];
    color: string;
    borderColor: string;
  }) => (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center gap-2 pb-3 border-b border-white/10 ${borderColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
        <h2 className="text-lg font-bold text-white">
          {title} ({items.length})
        </h2>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {items.map((item) => (
          <Card
            key={item.id}
            className="bg-neutral-950 border-white/10 hover:border-cyan-500/30 transition-colors group"
          >
            <CardContent className="p-4 flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <button className="text-neutral-500 hover:text-cyan-400 hover:bg-cyan-500/10 p-2 rounded-md transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-cyan-400 transition-colors">
                  {item._count.votes}
                </span>
              </div>

              <div className="flex flex-col">
                <h3 className="font-bold text-white text-base mb-1 group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
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
        badge={{ text: 'Roadmap' }}
      />

      <div className="flex justify-center -mt-8 mb-16 relative z-10">
        <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full px-8 py-6 h-auto text-base">
          Submit Feature Request
        </Button>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        {items.length === 0 ? (
          <div className="mx-auto max-w-xl text-white">
            <EmptyState
              title="No roadmap items published"
              description="Public roadmap items will appear here when maintainers publish planned, active, or completed work."
              icon={<Map className="h-8 w-8 text-cyan-400" />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
            <Column
              title="Planned"
              icon={CircleDashed}
              items={planned}
              color="text-neutral-500"
              borderColor="border-b-neutral-500"
            />
            <Column
              title="In Progress"
              icon={ArrowRightCircle}
              items={inProgress}
              color="text-cyan-400"
              borderColor="border-b-cyan-400"
            />
            <Column
              title="Completed"
              icon={CheckCircle2}
              items={completed}
              color="text-emerald-500"
              borderColor="border-b-emerald-500"
            />
          </div>
        )}
      </div>
    </main>
  );
}
