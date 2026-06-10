export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Package, ShieldCheck, Code, Cpu, BookOpen, Terminal, ChevronRight, Zap, Globe, GitBranch, Star } from 'lucide-react';
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
import PackageCard from '@/components/PackageCard';
import AnimatedTerminal from '@/components/AnimatedTerminal';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SparklesCore } from '@/components/ui/sparkles';
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { LampCTA } from '@/components/LampCTA';
import { GithubCommunityCTA } from '@/components/GithubCommunityCTA';
import { HeroSection } from '@/components/ui/hero-odyssey';
import { AhaSection } from '@/components/AhaSection';
import { HowItWorksTimeline } from '@/components/HowItWorksTimeline';
import { WorksWithStrip } from '@/components/WorksWithStrip';
import { Features as FeaturesSection } from '@/components/ui/features-8';

import { DynamicGooeyBackground } from '@/components/DynamicGooeyBackground';

async function getCommunityStats() {
  try {
    const [skillsCount, usersCount, executionsCount, downloadsResult] = await Promise.all([
      prisma.package.count(),
      prisma.user.count(),
      prisma.executionLog.count(),
      prisma.package.aggregate({
        _sum: {
          downloads: true,
        },
      }),
    ]);
    return { 
      skillsCount, 
      usersCount, 
      executionsCount, 
      downloadsCount: downloadsResult._sum.downloads || 0 
    };
  } catch {
    return { skillsCount: 0, usersCount: 0, executionsCount: 0, downloadsCount: 0 };
  }
}

async function getFeaturedPackages() {
  try {
    const packages = await prisma.package.findMany({
      take: 6,
      orderBy: { downloads: 'desc' },
      include: {
        owner: { select: { username: true } },
        versions: { orderBy: { publishedAt: 'desc' }, take: 1 },
      },
    });
    return packages.map(pkg => ({
      ...pkg,
      tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags,
      latestVersion: pkg.versions[0]?.version,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stats = await getCommunityStats();
  const packages = await getFeaturedPackages();

  return (
    <main className="relative min-h-screen overflow-hidden pb-16 bg-black text-white selection:bg-cyan-500/30">
      <DynamicGooeyBackground />
      <div className="container mx-auto px-4 relative z-10 pointer-events-none">
        <div className="pointer-events-auto">

        
        <HeroSection />

        <WorksWithStrip />

        {/* CLI Demo Section with Container Scroll */}
        <section className="w-full">
          <ContainerScroll
            titleComponent={
              <>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  One command to run anything.
                </h1>
              </>
            }
          >
            <div className="h-full w-full flex items-center justify-center bg-black rounded-2xl p-4">
              <AnimatedTerminal />
            </div>
          </ContainerScroll>
        </section>

        <AhaSection />

        <HowItWorksTimeline />

        {/* Features Grid */}
        <FeaturesSection />

        {/* Stats or Social Proof */}
        {process.env.NEXT_PUBLIC_STATS_LIVE === 'true' ? (
          <section className="my-24 rounded-xl border border-white/10 bg-neutral-950 p-10 shadow-sm flex flex-col md:flex-row items-center justify-around gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-50" />
            {[
              { val: stats.skillsCount, label: 'Total Skills' },
              { val: stats.usersCount, label: 'Contributors' },
              { val: stats.downloadsCount, label: 'Downloads' },
              { val: stats.executionsCount, label: 'Executions' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex flex-col md:flex-row items-center gap-8 w-full justify-center relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 font-mono text-4xl font-bold text-white">{stat.val.toLocaleString()}</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-cyan-500">{stat.label}</div>
                </div>
                {i < 3 && <div className="hidden md:block h-16 w-px bg-white/10" />}
              </div>
            ))}
          </section>
        ) : (
          <section className="my-24 grid md:grid-cols-3 gap-6">
            {[
              { q: "The simplest way I've found to distribute tools to my agent swarm.", author: "Senior AI Engineer" },
              { q: "Finally, package management for prompts and model configs.", author: "Open Source Maintainer" },
              { q: "We moved all our LangChain tools to SkillSpace. CI/CD is actually possible now.", author: "Startup CTO" },
            ].map((quote, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-neutral-950 p-8 shadow-sm flex flex-col justify-between">
                <p className="text-neutral-300 italic mb-6">"{quote.q}"</p>
                <div className="text-sm font-medium text-cyan-400">— {quote.author}</div>
              </div>
            ))}
          </section>
        )}

        {/* Package of the Week */}
        <section className="mb-16 rounded-2xl border border-white/10 bg-black py-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black pointer-events-none" />
          <div className="mx-auto max-w-2xl px-6 relative z-10 flex flex-col items-center">
            <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20">
              <Star className="h-3.5 w-3.5" /> Package of the Week
            </Badge>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">@core/autonomous-agent</h2>
            <div className="text-sm font-mono text-cyan-400 mb-4 tracking-tight">12.4k downloads this week</div>
            <p className="mb-8 text-lg text-neutral-400">A fully featured autonomous agent runner with tool use and memory.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-neutral-900 border border-white/10 rounded-md px-4 py-3 font-mono text-sm text-neutral-300">
                <span className="text-neutral-500 mr-2">$</span>
                skillspace install @core/autonomous-agent
              </div>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent h-[46px]">
                <Link href="/packages/autonomous-agent">View Package</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Packages */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white">Trending Skills</h2>
            <p className="text-lg text-neutral-400">Discover the most popular community capabilities.</p>
          </div>
          {packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 border-dashed bg-black/50 py-20 text-center">
              <Globe className="mb-4 h-12 w-12 text-neutral-600" />
              <h3 className="mb-2 text-xl font-semibold text-white">No trending skills yet</h3>
              <p className="mb-6 max-w-sm text-sm text-neutral-400">
                The registry is currently empty. Start the ecosystem by publishing the first high-quality skill.
              </p>
              <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                <Link href="/create">Learn how to publish</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, i) => (
                <PackageCard key={pkg.name} pkg={{ ...(pkg as any), isNew: i < 2 }} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Community Orbit CTA */}
        <section className="mt-24 mb-16 w-full px-4">
          <GithubCommunityCTA />
        </section>

        {/* Final CTA */}
        <section className="mt-24 mb-16">
          <LampCTA />
        </section>
        </div>
      </div>
    </main>
  );
}
