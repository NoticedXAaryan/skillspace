export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, Shield, RefreshCw, Cpu, BookOpen, Terminal, ChevronRight, Zap, Globe, Layers, Star } from 'lucide-react';
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
import { LampContainer } from '@/components/ui/lamp';

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
      <div className="container mx-auto px-4">
        
        {/* Hero Section */}
        <section className="relative mx-auto flex h-[40rem] w-full flex-col items-center justify-center overflow-hidden rounded-md bg-black">
          <div className="absolute inset-0 w-full h-full">
            <SparklesCore
              id="tsparticlesfullpage"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
          </div>
          <div className="z-10 text-center flex flex-col items-center">
            <Badge variant="outline" className="mb-8 px-4 py-1 text-sm font-medium tracking-wide uppercase bg-black/50 backdrop-blur-sm border-white/20 text-white">
              SkillSpace v0.1.0 is live
            </Badge>
            <TypewriterEffect 
              words={[
                { text: "Package", className: "text-white" },
                { text: "AI", className: "text-white" },
                { text: "Skills", className: "text-cyan-400" },
                { text: "Like", className: "text-white" },
                { text: "Software.", className: "text-white" }
              ]} 
              className="mb-6"
            />
            <p className="mb-10 max-w-2xl text-lg text-neutral-300 sm:text-xl">
              Install, version, share, and run AI capabilities across any model. The open-source registry and runtime for modern AI engineering.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-neutral-200 border-none">
                <Link href="/packages">
                  Explore Registry <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base border-white/20 hover:bg-white/10 text-white bg-transparent">
                <Link href="/docs">
                  <BookOpen className="mr-2 h-5 w-5" /> Documentation
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CLI Demo Section with Container Scroll */}
        <section className="w-full">
          <ContainerScroll
            titleComponent={
              <>
                <h1 className="text-4xl font-semibold text-white">
                  Execute seamlessly from <br />
                  <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-cyan-400">
                    the Terminal
                  </span>
                </h1>
              </>
            }
          >
            <div className="h-full w-full flex items-center justify-center bg-black rounded-2xl p-4">
              <AnimatedTerminal />
            </div>
          </ContainerScroll>
        </section>

        {/* What Is A Skill */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white">What is a Skill?</h2>
            <p className="text-lg text-neutral-400">A reproducible block of AI logic.</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row rounded-xl border border-white/10 bg-black p-8 shadow-sm">
            <div className="rounded-md border border-white/10 bg-neutral-900 px-5 py-3 font-medium text-white">Prompt</div>
            <div className="text-xl font-bold text-neutral-500 sm:rotate-0 rotate-90">+</div>
            <div className="rounded-md border border-white/10 bg-neutral-900 px-5 py-3 font-medium text-white">Workflow</div>
            <div className="text-xl font-bold text-neutral-500 sm:rotate-0 rotate-90">+</div>
            <div className="rounded-md border border-white/10 bg-neutral-900 px-5 py-3 font-medium text-white">Model Logic</div>
            <div className="text-xl font-bold text-neutral-500 sm:rotate-0 rotate-90">+</div>
            <div className="rounded-md border border-white/10 bg-neutral-900 px-5 py-3 font-medium text-white">Versioning</div>
            <div className="text-2xl font-bold text-cyan-400 sm:rotate-0 rotate-90 sm:mx-2">=</div>
            <div className="rounded-md bg-cyan-500 px-6 py-3 text-lg font-bold text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]">Skill</div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white">How It Works</h2>
            <p className="text-lg text-neutral-400">Ship capabilities in 3 simple steps.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { num: '1', title: 'Install', cmd: 'skillspace install @core/summary', desc: 'Add versioned skills to your project securely via CLI.' },
              { num: '2', title: 'Run', cmd: 'skillspace run @core/summary', desc: 'Execute locally or on your own infra across any LLM.' },
              { num: '3', title: 'Publish', cmd: 'skillspace publish', desc: 'Share your compiled workflows with the community.' },
            ].map((step) => (
              <Card key={step.num} className="relative overflow-hidden group hover:border-cyan-500/50 transition-colors bg-neutral-950 border-white/10">
                <div className="absolute -right-2 -top-4 text-9xl font-extrabold text-white/5 leading-none pointer-events-none transition-transform group-hover:scale-110">
                  {step.num}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-white">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="mb-4 block rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-sm text-cyan-400">
                    {step.cmd}
                  </code>
                  <p className="text-sm text-neutral-400">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-white">Why SkillSpace?</h2>
            <p className="text-lg text-neutral-400">Designed for production AI engineering.</p>
          </div>
          <BentoGrid className="max-w-4xl mx-auto">
            {[
              { icon: <RefreshCw className="h-5 w-5 text-neutral-500" />, title: 'Write Once', desc: 'Run your skills across Claude, OpenAI, and Ollama instantly.' },
              { icon: <Layers className="h-5 w-5 text-neutral-500" />, title: 'Versioned', desc: 'Predictable releases with explicit semantic versioning.' },
              { icon: <Globe className="h-5 w-5 text-neutral-500" />, title: 'Open Source', desc: '100% community-driven ecosystem. Build together.' },
              { icon: <Terminal className="h-5 w-5 text-neutral-500" />, title: 'Runtime Powered', desc: 'Consistent execution graphs across all environments.' },
              { icon: <Shield className="h-5 w-5 text-neutral-500" />, title: 'Secure', desc: 'Strict allowlists and governance. Code never leaks.' },
              { icon: <Zap className="h-5 w-5 text-neutral-500" />, title: 'Fast', desc: 'Optimized execution and caching out of the box.' },
            ].map((feature, i) => (
              <BentoGridItem
                key={i}
                title={feature.title}
                description={feature.desc}
                icon={feature.icon}
                className={i === 0 || i === 3 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </section>

        {/* Community Stats */}
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

        {/* Package of the Week */}
        <section className="mb-16 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 to-black py-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="mx-auto max-w-2xl px-6 relative z-10">
            <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border-cyan-500/20">
              <Star className="h-3.5 w-3.5" /> Package of the Week
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">@core/autonomous-agent</h2>
            <p className="mb-8 text-lg text-neutral-400">A fully featured autonomous agent runner with tool use and memory.</p>
            <Button asChild size="lg" className="bg-white text-black hover:bg-neutral-200 border-none">
              <Link href="/packages/autonomous-agent">View Package</Link>
            </Button>
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
                <PackageCard key={pkg.name} pkg={pkg as any} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Final CTA */}
        <section className="mt-24 mb-16">
          <LampContainer>
            <motion.h1
              initial={{ opacity: 0.5, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
              Ready to revolutionize <br /> your AI workflows?
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex mt-8 gap-4 flex-col sm:flex-row"
            >
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-cyan-500 text-black hover:bg-cyan-400 border-none">
                <Link href="/create">Publish a Skill</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 bg-transparent">
                <Link href="/packages">Browse Packages</Link>
              </Button>
            </motion.div>
          </LampContainer>
        </section>
      </div>
    </main>
  );
}
