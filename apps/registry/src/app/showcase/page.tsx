export const dynamic = 'force-dynamic';
import { ExternalLink, Rocket } from 'lucide-react';
import { PrismaClient } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeroSection } from '@/components/ui/hero-odyssey';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Showcase — SkillSpace',
  description: 'Projects and startups powered by the SkillSpace Runtime.',
};

export default async function ShowcasePage() {
  const projects = await prisma.showcaseProject.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const displayProjects = projects.length > 0 ? projects : [
    {
      id: '1',
      name: 'AgenticIDE',
      description: 'A fully autonomous Next.js IDE that uses SkillSpace to run arbitrary code actions within a sandboxed environment.',
      url: 'https://example.com',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      user: { username: 'skillspace-core' }
    },
    {
      id: '2',
      name: 'AutoResearcher',
      description: 'An AI researcher that compiles arXiv papers into readable podcasts using SkillSpace workflows.',
      url: 'https://example.com',
      imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
      user: { username: 'ai-researcher' }
    },
    {
      id: '3',
      name: 'DataSmith Pro',
      description: 'Enterprise data ETL powered entirely by community contributed data parsers on the SkillSpace registry.',
      url: 'https://example.com',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      user: { username: 'data-smith' }
    }
  ];

  return (
    <main className="min-h-screen bg-black pb-24">
      <HeroSection 
        title="Community Showcase"
        subtitle="Explore incredible applications and agents built on top of the SkillSpace Open Source Execution Runtime."
        align="center"
        badge={{ text: "Showcase" }}
      />
      <div className="flex justify-center -mt-8 mb-16 relative z-10">
        <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-full px-8 py-6 h-auto text-base">
          Submit Your Project
        </Button>
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProjects.map((proj) => (
            <a key={proj.id} href={proj.url} target="_blank" rel="noopener noreferrer" className="group block">
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
                    <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{proj.name}</h2>
                    <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 transition-colors mt-1" />
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-6 flex-grow">{proj.description}</p>
                  <div className="text-xs font-mono text-cyan-500/80 mt-auto pt-4 border-t border-white/10">
                    By @{proj.user?.username}
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
