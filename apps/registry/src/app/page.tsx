/* Hallmark · genre: modern-minimal · macrostructure: stat-led · theme: cobalt · enrichment: none · nav: existing · footer: layout */
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowRight, Download, Terminal, Share2, Globe, GitBranch, ShieldCheck } from 'lucide-react';
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
    <main className="relative bg-white text-zinc-900">

      {/* Hero — Stat-Led */}
      <section className="px-6 pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="mx-auto max-w-5xl">
          <Badge variant="secondary" className="mb-6 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium tracking-wide uppercase bg-blue-50 text-blue-700 border-blue-200">
            Open Source
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] mb-6 max-w-3xl">
            The package manager for AI capabilities
          </h1>

          <p className="text-lg md:text-xl text-zinc-500 mb-10 max-w-2xl leading-relaxed">
            Install, share, and version AI skills across any model.
            One command to install. One command to run.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
            <Button asChild size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 px-8 rounded-full text-sm font-medium">
              <Link href="/packages">
                Browse Registry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-12 px-8 rounded-full text-sm font-medium bg-transparent">
              <a href="https://github.com/NoticedXAaryan/skillspace" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 border-t border-zinc-200 pt-10">
            <div>
              <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
                {stats.skillsCount}
              </div>
              <div className="text-sm text-zinc-500 mt-1">packages published</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
                {stats.usersCount}
              </div>
              <div className="text-sm text-zinc-500 mt-1">developers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
                {stats.downloadsCount.toLocaleString()}
              </div>
              <div className="text-sm text-zinc-500 mt-1">total downloads</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — Step sequence */}
      <section className="px-6 py-20 border-t border-zinc-100">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-12">
            Three commands to go from discovery to execution
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-medium">
                  1
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Install</h3>
              </div>
              <p className="text-zinc-600 mb-4 leading-relaxed">
                Browse the registry and install capabilities with a single command.
              </p>
              <code className="block text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-zinc-700">
                <span className="text-zinc-400">$</span> skillspace install @skillspace/code-reviewer
              </code>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-medium">
                  2
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Run</h3>
              </div>
              <p className="text-zinc-600 mb-4 leading-relaxed">
                Execute any installed skill against your code, text, or data.
              </p>
              <code className="block text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-zinc-700">
                <span className="text-zinc-400">$</span> skillspace run code-reviewer --input ./src
              </code>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-xs font-medium">
                  3
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Share</h3>
              </div>
              <p className="text-zinc-600 mb-4 leading-relaxed">
                Package and publish your own capabilities for others to use.
              </p>
              <code className="block text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-zinc-700">
                <span className="text-zinc-400">$</span> skillspace publish
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Features — Asymmetric layout, not 3-col grid */}
      <section className="px-6 py-20 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            Why SkillSpace
          </h2>
          <p className="text-zinc-500 mb-12 max-w-lg">
            The package manager AI capabilities deserve. Cross-model, versioned, secure.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-8">
              <Globe className="h-5 w-5 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cross-Model Portability</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Write once, run on Claude, GPT-4, Gemini, or Ollama. Zero configuration changes needed.
                The Model Adapter Layer handles translation automatically.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-8">
              <GitBranch className="h-5 w-5 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Version Control</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Every capability is versioned with semver. Lock files ensure reproducible environments.
                Roll back when updates break things.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 p-8 md:col-span-2">
              <ShieldCheck className="h-5 w-5 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Execution</h3>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl">
                Capabilities declare their permissions. The runtime enforces them at execution time.
                Prompt injection scanning at publish time. No surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending — Real data or empty state */}
      <section className="px-6 py-20 border-t border-zinc-100">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {packages.length > 0 ? 'Trending' : 'Registry'}
              </h2>
              <p className="text-zinc-500 mt-1">
                {packages.length > 0
                  ? 'Discover what the community is building.'
                  : 'Be the first to publish a package.'}
              </p>
            </div>
            {packages.length > 0 && (
              <Button asChild variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 bg-transparent hidden sm:flex rounded-full text-sm">
                <Link href="/packages">View All</Link>
              </Button>
            )}
          </div>

          {packages.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl">
              <Download className="h-8 w-8 text-zinc-300 mx-auto mb-4" />
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

      {/* CTA */}
      <section className="px-6 py-20 border-t border-zinc-100">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            Start building with SkillSpace
          </h2>
          <p className="text-zinc-500 mb-8">
            Join the open-source community building the future of AI capability management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white h-12 px-8 rounded-full text-sm font-medium">
              <Link href="/packages">Browse Registry</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-12 px-8 rounded-full text-sm font-medium bg-transparent">
              <a href="https://github.com/NoticedXAaryan/skillspace" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}
