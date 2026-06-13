/* Hallmark · genre: modern-minimal · macrostructure: stat-led · theme: cobalt · enrichment: terminal-demo · nav: existing · footer: layout */
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowRight, Download, Terminal, Share2, Globe, GitBranch, ShieldCheck, Zap, Lock, Cpu, ChevronRight, Copy, CheckCircle2, Package, Users, ArrowUpRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PackageCard from '@/components/PackageCard';
import { AnimatedTerminal } from '@/components/ui/animated-terminal';
import { Features } from '@/components/ui/features-8';

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

async function getRecentPackages() {
  try {
    const packages = await prisma.package.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
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
  const recentPackages = await getRecentPackages();

  return (
    <main className="relative bg-white text-zinc-900">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Stat-Led with Terminal Demo
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium tracking-wide uppercase bg-blue-50 text-blue-700 border-blue-200">
                <Zap className="h-3 w-3" />
                Open Source
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
                The package manager for AI capabilities
              </h1>

              <p className="text-lg text-zinc-500 mb-8 max-w-lg leading-relaxed">
                Install, share, and version AI skills across any model.
                One command to install. One command to run.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                <Button asChild size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white h-11 px-7 rounded-full text-sm font-medium">
                  <Link href="/packages">
                    Browse Registry
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-11 px-7 rounded-full text-sm font-medium bg-transparent">
                  <a href="https://github.com/NoticedXAaryan/skillspace" target="_blank" rel="noopener noreferrer">
                    GitHub
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

              {/* Stats row */}
              <div className="flex gap-10 border-t border-zinc-200 pt-8">
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">
                    {stats.skillsCount}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">packages</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">
                    {stats.usersCount}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">developers</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">
                    {stats.downloadsCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">downloads</div>
                </div>
              </div>
            </div>

            {/* Right: Terminal Demo */}
            <div className="hidden lg:block">
              <AnimatedTerminal
                command="skillspace install @skillspace/security-review"
                output={`Resolved @skillspace/security-review@2.1.0
Downloaded 2.3 kB in 0.4s
Installed to ~/.skillspace/registry/`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 Steps with code examples
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 border-t border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-14">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                Three commands to ship
              </h2>
              <p className="text-zinc-500">
                From discovery to execution in seconds.
              </p>
            </div>
            <Link href="/docs" className="hidden md:flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Read the docs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Install',
                desc: 'Browse the registry and install capabilities with a single command.',
                code: 'skillspace install @skillspace/code-reviewer',
              },
              {
                step: '02',
                title: 'Run',
                desc: 'Execute any installed skill against your code, text, or data.',
                code: 'skillspace run code-reviewer --input ./src',
              },
              {
                step: '03',
                title: 'Share',
                desc: 'Package and publish your own capabilities for others to use.',
                code: 'skillspace publish',
              },
            ].map((item) => (
              <div key={item.step} className="group">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 h-full hover:border-zinc-300 hover:bg-white transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 text-white text-xs font-medium">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{item.title}</h3>
                  </div>
                  <p className="text-zinc-600 text-sm mb-5 leading-relaxed">
                    {item.desc}
                  </p>
                  <code className="block text-xs font-mono bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-zinc-700 group-hover:border-zinc-300 transition-colors">
                    <span className="text-zinc-400">$</span> {item.code}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — Bento Grid (uses features-8 component)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl">
          <Features />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PLATFORM SUPPORT — Model logos strip
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-16 border-t border-zinc-100">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 mb-8">
            Works with every major AI provider
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {['Claude', 'GPT-4o', 'Gemini', 'Ollama', 'Mistral', 'Llama'].map((name) => (
              <span key={name} className="text-lg font-semibold text-zinc-300 hover:text-zinc-900 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TRENDING PACKAGES — Real data from DB
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 border-t border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {packages.length > 0 ? 'Trending packages' : 'Registry'}
              </h2>
              <p className="text-zinc-500 mt-1">
                {packages.length > 0
                  ? 'Discover what the community is building.'
                  : 'Be the first to publish a package.'}
              </p>
            </div>
            {packages.length > 0 && (
              <Button asChild variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 bg-transparent hidden sm:flex rounded-full text-sm">
                <Link href="/packages">View all</Link>
              </Button>
            )}
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl">
              <Package className="h-8 w-8 text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500 mb-4">No packages published yet.</p>
              <Button asChild size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full">
                <Link href="/create">Publish the first package</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, i) => (
                <PackageCard key={pkg.name} pkg={{ ...(pkg as any), isNew: i < 2 }} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          RECENTLY PUBLISHED — Real data from DB
          ═══════════════════════════════════════════════════════════════ */}
      {recentPackages.length > 0 && (
        <section className="px-6 py-20 bg-zinc-50 border-t border-zinc-100">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Recently published
                </h2>
                <p className="text-zinc-500 mt-1">
                  Fresh capabilities from the community.
                </p>
              </div>
              <Button asChild variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-white bg-transparent hidden sm:flex rounded-full text-sm">
                <Link href="/packages">Browse all</Link>
              </Button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentPackages.map((pkg, i) => (
                <PackageCard key={pkg.name} pkg={{ ...(pkg as any), isNew: true }} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CLI CODE EXAMPLE — Full-width terminal
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 border-t border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                Built for the command line
              </h2>
              <p className="text-zinc-500 mb-6 leading-relaxed">
                SkillSpace feels like npm, but for AI. Install capabilities, run them against your code,
                and publish your own — all from the terminal.
              </p>
              <div className="space-y-3">
                {[
                  'Install skills from the registry in seconds',
                  'Run any skill against your code, text, or data',
                  'Publish your own skills for the community',
                  'Version control with lock files for reproducibility',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-600">{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="mt-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-sm font-medium">
                <Link href="/docs">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs font-mono text-zinc-500">terminal</span>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed">
                <div className="text-zinc-500 mb-1"># Install a skill</div>
                <div className="text-zinc-300 mb-4">
                  <span className="text-emerald-400">$</span> skillspace install @skillspace/code-reviewer
                </div>
                <div className="text-zinc-500 mb-1"># Run it against your code</div>
                <div className="text-zinc-300 mb-4">
                  <span className="text-emerald-400">$</span> skillspace run code-reviewer --input ./src
                </div>
                <div className="text-zinc-500 mb-1"># Publish your own</div>
                <div className="text-zinc-300 mb-4">
                  <span className="text-emerald-400">$</span> skillspace publish
                </div>
                <div className="text-zinc-500 mb-1"># Check what&apos;s installed</div>
                <div className="text-zinc-300">
                  <span className="text-emerald-400">$</span> skillspace list
                </div>
                <div className="mt-3 text-zinc-500">
                  <div>@skillspace/code-reviewer@1.2.0</div>
                  <div>@skillspace/security-review@2.1.0</div>
                  <div>@skillspace/bash-expert@1.0.3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECURITY — Trust section
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
              Security built in, not bolted on
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Every capability declares its permissions upfront. The runtime enforces them.
              No silent network calls, no hidden file access, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Permission declarations',
                desc: 'Skills declare exactly what they need — filesystem access, network calls, tool usage. The runtime blocks anything not declared.',
              },
              {
                icon: Lock,
                title: 'Prompt injection scanning',
                desc: 'Every published skill is scanned for prompt injection patterns at publish time. Critical findings are blocked automatically.',
              },
              {
                icon: Cpu,
                title: 'Sandboxed execution',
                desc: 'Skills run in isolated contexts with strict permission boundaries. A skill cannot exceed its declared capabilities.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl border border-zinc-200 p-6">
                <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-zinc-700" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          COMPARISON — Why SkillSpace vs alternatives
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 border-t border-zinc-100">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10 text-center">
            Why teams choose SkillSpace
          </h2>

          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 bg-zinc-50 border-b border-zinc-200 text-xs font-medium uppercase tracking-wider text-zinc-500">
              <div className="px-5 py-3">Feature</div>
              <div className="px-5 py-3 text-center">SkillSpace</div>
              <div className="px-5 py-3 text-center">Manual prompts</div>
              <div className="px-5 py-3 text-center">Platform-locked</div>
            </div>
            {[
              { feature: 'Version control', skillspace: true, manual: false, locked: false },
              { feature: 'Cross-model portability', skillspace: true, manual: false, locked: false },
              { feature: 'Team sharing', skillspace: true, manual: false, locked: true },
              { feature: 'Security scanning', skillspace: true, manual: false, locked: false },
              { feature: 'Lock files', skillspace: true, manual: false, locked: false },
              { feature: 'CLI workflow', skillspace: true, manual: false, locked: false },
            ].map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-4 text-sm ${i < 5 ? 'border-b border-zinc-100' : ''}`}>
                <div className="px-5 py-3.5 font-medium text-zinc-700">{row.feature}</div>
                <div className="px-5 py-3.5 text-center">
                  {row.skillspace ? (
                    <CheckCircle2 className="h-4 w-4 text-zinc-900 mx-auto" />
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </div>
                <div className="px-5 py-3.5 text-center">
                  {row.manual ? (
                    <CheckCircle2 className="h-4 w-4 text-zinc-900 mx-auto" />
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </div>
                <div className="px-5 py-3.5 text-center">
                  {row.locked ? (
                    <CheckCircle2 className="h-4 w-4 text-zinc-900 mx-auto" />
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA — Final call to action
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 border-t border-zinc-100">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Start building with SkillSpace
          </h2>
          <p className="text-lg text-zinc-500 mb-10 max-w-xl mx-auto">
            Join the open-source community building the future of AI capability management.
            Install your first skill in under 30 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button asChild size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 px-8 rounded-full text-sm font-medium">
              <Link href="/packages">
                Browse Registry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-12 px-8 rounded-full text-sm font-medium bg-transparent">
              <a href="https://github.com/NoticedXAaryan/skillspace" target="_blank" rel="noopener noreferrer">
                View on GitHub
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-sm text-zinc-600 font-mono">
            <span className="text-zinc-400">$</span>
            npx skillspace install
          </div>
        </div>
      </section>

    </main>
  );
}
