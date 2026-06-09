export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Package, Shield, RefreshCw, Cpu, BookOpen, Terminal, ChevronRight, Zap, Globe, Layers, Star } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import AnimatedTerminal from '@/components/AnimatedTerminal';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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
    <main className="relative min-h-screen overflow-hidden pb-16">
      <div className="absolute left-1/2 top-[-20%] -z-10 h-[600px] w-[1000px] -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="mx-auto flex max-w-4xl flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Badge variant="outline" className="mb-8 px-4 py-1 text-sm font-medium tracking-wide uppercase">
            SkillSpace v0.1.0 is live
          </Badge>
          <h1 className="mb-6 bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            Package AI Skills Like Software.
          </h1>
          <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Install, version, share, and run AI capabilities across any model. The open-source registry and runtime for modern AI engineering.
          </p>
          
          <div className="w-full max-w-3xl mb-10">
            <AnimatedTerminal />
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/packages">
                Explore Registry <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/docs">
                <BookOpen className="mr-2 h-5 w-5" /> Documentation
              </Link>
            </Button>
          </div>
        </section>

        {/* What Is A Skill */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">What is a Skill?</h2>
            <p className="text-lg text-muted-foreground">A reproducible block of AI logic.</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row rounded-xl border bg-card p-8 shadow-sm">
            <div className="rounded-md border bg-muted px-5 py-3 font-medium text-foreground">Prompt</div>
            <div className="text-xl font-bold text-muted-foreground sm:rotate-0 rotate-90">+</div>
            <div className="rounded-md border bg-muted px-5 py-3 font-medium text-foreground">Workflow</div>
            <div className="text-xl font-bold text-muted-foreground sm:rotate-0 rotate-90">+</div>
            <div className="rounded-md border bg-muted px-5 py-3 font-medium text-foreground">Model Logic</div>
            <div className="text-xl font-bold text-muted-foreground sm:rotate-0 rotate-90">+</div>
            <div className="rounded-md border bg-muted px-5 py-3 font-medium text-foreground">Versioning</div>
            <div className="text-2xl font-bold text-primary sm:rotate-0 rotate-90 sm:mx-2">=</div>
            <div className="rounded-md bg-primary px-6 py-3 text-lg font-bold text-primary-foreground shadow-[0_0_20px_rgba(255,255,255,0.1)]">Skill</div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-lg text-muted-foreground">Ship capabilities in 3 simple steps.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { num: '1', title: 'Install', cmd: 'skillspace install @core/summary', desc: 'Add versioned skills to your project securely via CLI.' },
              { num: '2', title: 'Run', cmd: 'skillspace run @core/summary', desc: 'Execute locally or on your own infra across any LLM.' },
              { num: '3', title: 'Publish', cmd: 'skillspace publish', desc: 'Share your compiled workflows with the community.' },
            ].map((step) => (
              <Card key={step.num} className="relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute -right-2 -top-4 text-9xl font-extrabold text-muted/20 leading-none pointer-events-none transition-transform group-hover:scale-110">
                  {step.num}
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="mb-4 block rounded-md border bg-muted px-3 py-2 font-mono text-sm text-foreground">
                    {step.cmd}
                  </code>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Why SkillSpace?</h2>
            <p className="text-lg text-muted-foreground">Designed for production AI engineering.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: RefreshCw, title: 'Write Once', desc: 'Run your skills across Claude, OpenAI, and Ollama instantly.' },
              { icon: Layers, title: 'Versioned', desc: 'Predictable releases with explicit semantic versioning.' },
              { icon: Globe, title: 'Open Source', desc: '100% community-driven ecosystem. Build together.' },
              { icon: Terminal, title: 'Runtime Powered', desc: 'Consistent execution graphs across all environments.' },
              { icon: Shield, title: 'Secure', desc: 'Strict allowlists and governance. Code never leaks.' },
              { icon: Zap, title: 'Fast', desc: 'Optimized execution and caching out of the box.' },
            ].map((feature) => (
              <Card key={feature.title} className="transition-all hover:translate-y-[-2px]">
                <CardHeader>
                  <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-2.5 w-max text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Community Stats */}
        <section className="my-24 rounded-xl border bg-card p-10 shadow-sm flex flex-col md:flex-row items-center justify-around gap-8">
          {[
            { val: stats.skillsCount, label: 'Total Skills' },
            { val: stats.usersCount, label: 'Contributors' },
            { val: stats.downloadsCount, label: 'Downloads' },
            { val: stats.executionsCount, label: 'Executions' },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col md:flex-row items-center gap-8 w-full justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="mb-2 font-mono text-4xl font-bold text-foreground">{stat.val.toLocaleString()}</div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</div>
              </div>
              {i < 3 && <div className="hidden md:block h-16 w-px bg-border" />}
            </div>
          ))}
        </section>

        {/* Package of the Week */}
        <section className="mb-16 rounded-2xl border bg-gradient-to-br from-zinc-950 to-zinc-900 py-16 text-center shadow-lg">
          <div className="mx-auto max-w-2xl px-6">
            <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 font-bold tracking-widest uppercase">
              <Star className="h-3.5 w-3.5" /> Package of the Week
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">@core/autonomous-agent</h2>
            <p className="mb-8 text-lg text-muted-foreground">A fully featured autonomous agent runner with tool use and memory.</p>
            <Button asChild size="lg">
              <Link href="/packages/autonomous-agent">View Package</Link>
            </Button>
          </div>
        </section>

        {/* Featured Packages */}
        <section className="py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Trending Skills</h2>
            <p className="text-lg text-muted-foreground">Discover the most popular community capabilities.</p>
          </div>
          {packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
              <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No trending skills yet</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                The registry is currently empty. Start the ecosystem by publishing the first high-quality skill.
              </p>
              <Button asChild variant="outline">
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
        <section className="mt-24 mb-16 rounded-3xl border border-border bg-card/50 p-12 text-center shadow-inner backdrop-blur-sm sm:p-20">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Ready to revolutionize your AI workflows?</h2>
          <p className="mb-8 text-lg text-muted-foreground">Join the open source ecosystem today.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-8 text-lg">
              <Link href="/create">Publish a Skill</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
              <Link href="/packages">Browse Packages</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
