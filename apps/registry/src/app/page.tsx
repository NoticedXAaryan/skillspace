export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Package, ShieldCheck, Code, Cpu, Terminal, ChevronRight, Zap, Globe, GitBranch, Star, ArrowRight, Download } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PackageCard from '@/components/PackageCard';

async function getCommunityStats() {
  try {
    const [skillsCount, usersCount, downloadsResult] = await Promise.all([
      prisma.package.count(),
      prisma.user.count(),
      prisma.package.aggregate({ _sum: { downloads: true } }),
    ]);
    return {
      skillsCount,
      usersCount,
      downloadsCount: downloadsResult._sum.downloads || 0,
    };
  } catch {
    return { skillsCount: 0, usersCount: 0, downloadsCount: 0 };
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
    <main className="relative min-h-screen overflow-hidden bg-black text-white selection:bg-cyan-500/30">

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black pointer-events-none" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            <Zap className="h-3.5 w-3.5" /> Open Source
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Install AI capabilities<br />like npm packages
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl mx-auto">
            Share, version, and run AI skills across any model.
            One command to install. One command to run.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold h-12 px-8">
              <Link href="/packages">Browse Registry <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent h-12 px-8">
              <Link href="/docs">Documentation</Link>
            </Button>
          </div>

          {/* Terminal Demo */}
          <div className="mx-auto max-w-2xl rounded-xl border border-white/10 bg-neutral-950 shadow-2xl overflow-hidden">
            <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-black px-4">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs font-mono text-neutral-500">terminal</span>
            </div>
            <div className="p-6 font-mono text-sm text-left">
              <div className="flex gap-2 mb-2">
                <span className="text-cyan-400">$</span>
                <span className="text-neutral-300">air install @skillspace/security-review</span>
              </div>
              <div className="text-neutral-500 mb-4 ml-4">
                Resolved @skillspace/security-review@2.1.0<br />
                Downloaded 2.3 kB in 0.4s<br />
                Installed to ~/.skillspace/registry/
              </div>
              <div className="flex gap-2 mb-2">
                <span className="text-cyan-400">$</span>
                <span className="text-neutral-300">air run security-review --input ./src</span>
              </div>
              <div className="text-green-400 ml-4">
                Found 2 vulnerabilities in 3 files
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-lg text-neutral-400">Three commands to go from discovery to execution.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Install',
                description: 'Browse the registry and install capabilities with a single command.',
                code: 'air install @skillspace/code-reviewer',
                icon: <Download className="h-6 w-6 text-cyan-400" />,
              },
              {
                step: '02',
                title: 'Run',
                description: 'Execute any installed skill against your code, text, or data.',
                code: 'air run code-reviewer --input ./src',
                icon: <Terminal className="h-6 w-6 text-cyan-400" />,
              },
              {
                step: '03',
                title: 'Share',
                description: 'Package and publish your own capabilities for others to use.',
                code: 'air publish',
                icon: <Globe className="h-6 w-6 text-cyan-400" />,
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="rounded-xl border border-white/10 bg-neutral-950 p-8 h-full hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    {item.icon}
                    <span className="text-xs font-mono text-neutral-500">Step {item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-neutral-400 mb-6">{item.description}</p>
                  <div className="bg-black rounded-lg border border-white/5 p-4 font-mono text-sm">
                    <span className="text-cyan-400">$</span> <span className="text-neutral-300">{item.code.replace('air ', '')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why SkillSpace</h2>
            <p className="text-lg text-neutral-400">The package manager AI capabilities deserve.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-6 w-6 text-cyan-400" />,
                title: 'Cross-Model Portability',
                description: 'Write once, run on Claude, GPT-4, Gemini, or Ollama. Zero YAML changes needed.',
              },
              {
                icon: <GitBranch className="h-6 w-6 text-cyan-400" />,
                title: 'Version Control',
                description: 'Every capability is versioned with semver. Roll back when updates break things.',
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-cyan-400" />,
                title: 'Secure Execution',
                description: 'Capabilities declare their permissions. The runtime enforces them. No surprises.',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-white/10 bg-neutral-950 p-8 hover:border-cyan-500/30 transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Packages */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Trending Skills</h2>
              <p className="text-neutral-400">Discover what the community is building.</p>
            </div>
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent hidden sm:flex">
              <Link href="/packages">View All <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          {packages.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: '@skillspace/security-review', description: 'Analyze code for security vulnerabilities using OWASP Top 10', tags: ['security', 'code-review'], downloads: 1247 },
                { name: '@skillspace/code-reviewer', description: 'Reads diffs and provides comprehensive code review', tags: ['code-review', 'quality'], downloads: 892 },
                { name: '@skillspace/bash-expert', description: 'Converts English requests into precise bash commands', tags: ['bash', 'cli'], downloads: 634 },
                { name: '@skillspace/git-commit-gen', description: 'Generates conventional commit messages from diffs', tags: ['git', 'workflow'], downloads: 521 },
                { name: '@skillspace/sql-optimizer', description: 'Analyzes SQL queries and suggests performance optimizations', tags: ['sql', 'database'], downloads: 403 },
                { name: '@skillspace/unit-test-gen', description: 'Generates unit tests including edge cases and error handling', tags: ['testing', 'quality'], downloads: 378 },
              ].map((pkg, i) => (
                <div key={pkg.name} className="group rounded-xl border border-white/10 bg-neutral-950 p-6 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <Package className="h-5 w-5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-mono text-neutral-500 flex items-center gap-1">
                      <Download className="h-3 w-3" /> {pkg.downloads.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1 font-mono text-sm">{pkg.name}</h3>
                  <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {pkg.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-white/5 text-neutral-400 border-white/10">{tag}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <code className="text-xs font-mono text-neutral-500">
                      <span className="text-cyan-400">$</span> air install {pkg.name}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, i) => (
                <PackageCard key={pkg.name} pkg={{ ...(pkg as any), isNew: i < 2 }} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Start building with SkillSpace
          </h2>
          <p className="text-lg text-neutral-400 mb-8">
            Join the open-source community building the future of AI capability management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold h-12 px-8">
              <Link href="/packages">Browse Registry</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent h-12 px-8">
              <a href="https://github.com/skillspace/skillspace" target="_blank" rel="noopener noreferrer">
                <Code className="mr-2 h-4 w-4" /> View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-400" />
              <span className="font-semibold">SkillSpace</span>
              <span className="text-neutral-500 text-sm">v0.1.0</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-400">
              <Link href="/packages" className="hover:text-white transition-colors">Registry</Link>
              <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <a href="https://github.com/skillspace/skillspace" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
            <div className="text-sm text-neutral-500">
              MIT License
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
