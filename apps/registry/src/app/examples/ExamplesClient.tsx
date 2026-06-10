'use client';

import { useState } from 'react';
import { Terminal, Download, Star, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';
import CodeBlockClient from '@/components/CodeBlockClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Example {
  id: string;
  name: string;
  category: string;
  author: string;
  downloads: number;
  stars: number;
  installCmd: string;
  input: string;
  output: string;
}

export default function ExamplesClient({ examples }: { examples: Example[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(examples.map((e) => e.category)))];

  const filteredExamples = activeCategory === 'All' 
    ? examples 
    : examples.filter((e) => e.category === activeCategory);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4 bg-neutral-950/80 border border-white/10 rounded-2xl p-4 backdrop-blur-sm overflow-x-auto">
        <Filter className="w-5 h-5 text-cyan-400 shrink-0 ml-2" />
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredExamples.map(ex => (
          <Card key={ex.id} className="bg-neutral-950 border-white/10 hover:border-cyan-500/30 transition-colors group flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{ex.name}</h2>
                <div className="flex items-center gap-3 text-sm font-mono text-neutral-500">
                  <span className="flex items-center gap-1"><Download className="w-4 h-4 text-neutral-600" /> {ex.downloads.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500" /> {ex.stars.toLocaleString()}</span>
                </div>
              </div>
              <Link href={`/packages/${ex.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-neutral-400 hover:text-cyan-400 mb-6 block w-fit">
                @{ex.author}
              </Link>

              <div className="flex items-center gap-3 bg-black border border-white/10 rounded-lg p-3 font-mono text-sm text-cyan-400 mb-6">
                <Terminal className="w-4 h-4 text-neutral-500 shrink-0" />
                <code className="truncate">{ex.installCmd}</code>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 mb-6">
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Input</div>
                  <div className="flex-1 bg-black border border-white/10 rounded-lg overflow-hidden [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-4">
                    <CodeBlockClient html={`<pre><code>${ex.input}</code></pre>`} rawCode={ex.input} language="text" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Output</div>
                  <div className="flex-1 bg-black border border-white/10 rounded-lg overflow-hidden [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-4">
                    <CodeBlockClient html={`<pre><code>${ex.output}</code></pre>`} rawCode={ex.output} language="markdown" />
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <Button variant="secondary" className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10">
                  View Source Code <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
