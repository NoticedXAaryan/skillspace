import React from 'react';

const LOGOS = [
  { name: 'Next.js', label: 'Next.js' },
  { name: 'Node.js', label: 'Node.js' },
  { name: 'Python', label: 'Python' },
  { name: 'LangChain', label: 'LangChain' },
  { name: 'Vercel', label: 'Vercel' },
  { name: 'Cloudflare', label: 'Cloudflare' },
];

export function WorksWithStrip() {
  return (
    <section className="py-12 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-sm text-neutral-500 font-mono mb-8 uppercase tracking-widest">Works wherever you write code</p>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50 hover:opacity-100 transition-opacity duration-500">
          {LOGOS.map((logo) => (
             <div key={logo.name} className="text-neutral-400 font-semibold text-lg hover:text-white transition-colors cursor-default">
               {logo.label}
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
