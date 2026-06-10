import React from 'react';
import { Star, Scale } from 'lucide-react';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.19-.34 6.52-1.58 6.52-7.02a5.36 5.36 0 0 0-1.5-3.8 5.4 5.4 0 0 0-.15-3.75s-1.2-.38-3.9 1.45a13.2 13.2 0 0 0-7 0c-2.7-1.83-3.9-1.45-3.9-1.45a5.4 5.4 0 0 0-.15 3.75 5.36 5.36 0 0 0-1.5 3.8c0 5.4 3.33 6.66 6.52 7.02a4.8 4.8 0 0 0-1 3.02v4" />
    <path d="M9 20c-5 1.5-5-2.5-7-3" />
  </svg>
);
import Link from 'next/link';

export function GithubCommunityCTA() {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950 p-12 text-center shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="h-16 w-16 bg-neutral-900 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-xl">
          <GithubIcon className="h-8 w-8 text-white" />
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Backed by an active open-source community
        </h2>
        <p className="mb-10 text-lg text-neutral-400 max-w-xl text-center">
          SkillSpace is built in the open. Contribute to the core runtime, registry, and CLI tools on GitHub.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto mb-10">
          <div className="flex flex-col items-center justify-center p-6 bg-black border border-white/10 rounded-xl hover:border-cyan-500/30 transition-colors">
            <Star className="h-6 w-6 text-yellow-500 mb-3" />
            <div className="text-2xl font-bold text-white font-mono">1.2k+</div>
            <div className="text-sm text-neutral-500 font-medium uppercase tracking-wider mt-1">GitHub Stars</div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-black border border-white/10 rounded-xl hover:border-cyan-500/30 transition-colors">
             <Scale className="h-6 w-6 text-neutral-400 mb-3" />
             <div className="text-2xl font-bold text-white font-mono">MIT</div>
             <div className="text-sm text-neutral-500 font-medium uppercase tracking-wider mt-1">Open Source</div>
          </div>
        </div>

        <Link
          href="https://github.com/skillspace/skillspace"
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-colors"
        >
          <GithubIcon className="h-5 w-5" />
          Star on GitHub
        </Link>
      </div>
    </div>
  );
}
