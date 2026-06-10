import { Library, Download, Star, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import examplesData from '@/data/examples.json';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/ui/hero-odyssey';

export const metadata = {
  title: 'Collections — SkillSpace',
  description: 'Curated lists of the best AI capabilities.',
};

export default function CollectionsPage() {
  // Group examples by category for the collections
  const grouped = examplesData.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {} as Record<string, typeof examplesData>);

  return (
    <main className="min-h-screen bg-black">
      <HeroSection 
        title="Curated Collections"
        subtitle="Discover the highest-rated capabilities grouped by use-case."
        align="center"
        badge={{ text: "Featured" }}
      />

      <div className="container mx-auto px-6 py-12 flex flex-col gap-16 max-w-7xl">
        {Object.keys(grouped).map(category => (
          <div key={category} className="flex flex-col gap-6">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
              <h2 className="text-3xl font-bold text-white tracking-tight">Top {category} Skills</h2>
              <Link href={`/examples?category=${category}`} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                View all {grouped[category].length} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grouped[category].slice(0, 3).map((ex: any) => (
                <Card key={ex.id} className="bg-neutral-950 border-white/10 hover:border-cyan-500/50 hover:shadow-[0_8px_32px_rgba(34,211,238,0.15)] transition-all duration-300 flex flex-col justify-between group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl text-white group-hover:text-cyan-400 transition-colors">{ex.name}</CardTitle>
                      <div className="flex gap-3 text-xs text-neutral-400">
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {ex.downloads.toLocaleString()}</span>
                        <span className="flex items-center gap-1 text-yellow-500/80"><Star className="w-3 h-3" /> {ex.stars.toLocaleString()}</span>
                      </div>
                    </div>
                    <Link href={`/packages/${ex.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-neutral-500 hover:text-white transition-colors block">
                      @{ex.author}
                    </Link>
                  </CardHeader>

                  <CardContent className="mt-auto">
                    <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-xs text-neutral-400 overflow-x-auto">
                      <code>{ex.installCmd}</code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
