export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { ExternalLink, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroSection } from '@/components/ui/hero-odyssey';
import EmptyState from '@/components/EmptyState';

export const metadata = {
  title: 'Showcase — SkillSpace',
  description: 'Projects and startups powered by the SkillSpace Runtime.',
};

export default async function ShowcasePage() {
  const projects = await prisma.showcaseProject.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection
        title="Community Showcase"
        subtitle="Explore incredible applications and agents built on top of the SkillSpace Open Source Execution Runtime."
        align="center"
        badge={{ text: 'Showcase' }}
      />
      <div className="flex justify-center -mt-8 mb-16 relative z-10">
        <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full px-8 py-6 h-auto text-base">
          Submit Your Project
        </Button>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        {projects.length === 0 ? (
          <div className="mx-auto max-w-xl text-white">
            <EmptyState
              title="No showcase projects yet"
              description="Published community projects will appear here after maintainers submit real SkillSpace-powered work."
              icon={<Rocket className="h-8 w-8 text-cyan-400" />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <a
                key={proj.id}
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card className="bg-neutral-950 border-white/10 hover:border-cyan-500/50 hover:shadow-[0_8px_32px_rgba(34,211,238,0.15)] transition-all duration-300 h-full overflow-hidden flex flex-col">
                  <div className="relative aspect-video w-full bg-neutral-900 overflow-hidden">
                    {proj.imageUrl ? (
                      <img
                        src={proj.imageUrl}
                        alt={proj.name}
                        className="object-cover w-full h-full opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 border-b border-white/5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent opacity-80" />
                  </div>

                  <CardContent className="flex flex-col flex-grow p-6 pt-6 relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {proj.name}
                      </h2>
                      <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 transition-colors mt-1" />
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-6 flex-grow">
                      {proj.description}
                    </p>
                    <div className="text-xs font-mono text-cyan-500/80 mt-auto pt-4 border-t border-white/10">
                      By @{proj.user?.username}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
