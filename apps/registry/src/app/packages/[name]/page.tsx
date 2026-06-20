import VersionPicker from '@/components/VersionPicker';
import InstallCard from '@/components/InstallCard';
import { Shield, Download, Clock, User, Box, Terminal, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import PackageTabs from './PackageTabs';
import { inferModelCompatibility } from '@/lib/model-compatibility';
import yaml from 'js-yaml';
import { AnimatedTerminal } from '@/components/ui/animated-terminal';
import { Play, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const pkg = await prisma.package.findUnique({ where: { name } });

  const title = pkg ? `${pkg.name} — SkillSpace` : 'Package Not Found — SkillSpace';
  const description = pkg?.description || 'View capabilities on the SkillSpace registry.';
  const url = `https://skillspace.example.com/packages/${name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'SkillSpace',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

function extractReadme(manifestYaml: string): string | null {
  if (!manifestYaml) return null;
  const readmeMatch = manifestYaml.match(/readme:\s*\|-?\n([\s\S]*?)(?=\n[a-z_]+:|$)/i);
  if (readmeMatch) {
    const lines = readmeMatch[1].split('\n');
    return lines.map((l) => l.replace(/^ {2}/, '')).join('\n');
  }
  return null;
}

function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  let inCodeBlock = false;
  let codeContent: string[] = [];
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div
            key={`code-${i}`}
            className="my-6 rounded-md bg-zinc-950 p-4 font-mono text-sm shadow-sm overflow-x-auto"
          >
            <pre className="text-zinc-300">
              <code>{codeContent.join('\n')}</code>
            </pre>
          </div>,
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="mt-6 mb-3 text-lg font-semibold text-foreground">
          {line.slice(4)}
        </h4>,
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="mt-8 mb-4 text-xl font-bold text-foreground">
          {line.slice(3)}
        </h3>,
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2
          key={i}
          className="mt-10 mb-5 border-b border-border pb-2 text-2xl font-bold text-foreground"
        >
          {line.slice(2)}
        </h2>,
      );
      continue;
    }
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-3" />);
      continue;
    }

    // Inline code replacement
    const parts = line.split(/(`[^`]+`)/g);
    elements.push(
      <p key={i} className="mb-2 leading-relaxed text-muted-foreground">
        {parts.map((part, j) =>
          part.startsWith('`') && part.endsWith('`') ? (
            <code
              key={j}
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {part.slice(1, -1)}
            </code>
          ) : (
            part
          ),
        )}
      </p>,
    );
  }
  return elements;
}

function buildGitHubFileUrl(
  pkg: { githubUrl: string | null; githubBranch: string | null; githubPath: string | null },
  commitSha: string | null,
): string | null {
  if (!pkg.githubUrl || !pkg.githubBranch || !pkg.githubPath) return null;
  const ref = commitSha || pkg.githubBranch;
  return `${pkg.githubUrl}/blob/${ref}/${pkg.githubPath}`;
}

export default async function PackagePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  const pkg = await prisma.package.findUnique({
    where: { name },
    include: {
      owner: { select: { id: true, username: true } },
      versions: { orderBy: { publishedAt: 'desc' } },
    },
  });

  if (!pkg) {
    return (
      <main className="container mx-auto px-4 py-32 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Package Not Found</h1>
        <p className="text-lg text-muted-foreground">
          The capability "{name}" doesn't exist in the registry.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          ← Back to Registry
        </Link>
      </main>
    );
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(pkg.tags as string);
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  const allVersions = pkg.versions || [];
  const latestVersion = allVersions[0];

  const readme = latestVersion?.manifest ? extractReadme(latestVersion.manifest as string) : null;
  const compatibleModels = latestVersion?.manifest
    ? inferModelCompatibility(
        yaml.load(latestVersion.manifest as string) as Record<string, unknown>,
      )
    : [];

  // GitHub source link
  const githubSourceUrl = buildGitHubFileUrl(pkg, latestVersion?.githubCommit || null);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="min-w-0">
          <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl mb-8">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="p-10 relative z-10">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                      <Box className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-1">
                        {pkg.name}
                      </h1>
                      <div className="flex items-center gap-3 text-sm text-neutral-400 font-mono">
                        <span>v{latestVersion?.version || '0.0.0'}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-600" />
                        <span>{pkg.owner?.username}</span>
                      </div>
                    </div>
                  </div>

                  <p className="max-w-2xl text-lg leading-relaxed text-neutral-300 mt-6">
                    {pkg.description}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/10 transition-colors font-mono cursor-default"
                      >
                        {tag}
                      </span>
                    ))}
                    {compatibleModels.map((model: string) => (
                      <span
                        key={model}
                        className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-sm font-semibold tracking-wider"
                      >
                        {model}
                      </span>
                    ))}
                    {pkg.type && (
                      <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold uppercase tracking-wider">
                        {pkg.type}
                      </span>
                    )}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    {(pkg.verified || pkg.verifiedBy) && (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full text-xs font-medium">
                        <Shield className="w-3.5 h-3.5" /> GitHub Verified
                      </span>
                    )}
                    {/* TODO(Task 3.4): If scan results are stored in the DB in the future, display <span className="text-xs text-neutral-400">Prompt injection scan: passed</span> here */}
                    {!pkg.isPrivate && (
                      <span className="flex items-center gap-2 text-sm font-medium text-blue-400">
                        <Box className="h-4 w-4" /> Open Source
                      </span>
                    )}
                    {pkg.githubUrl && (
                      <div className="text-sm text-neutral-400 font-mono">
                        Source: {pkg.githubUrl}/tree/{pkg.githubBranch}/{pkg.githubPath}
                      </div>
                    )}
                    {latestVersion?.githubCommit && (
                      <a
                        href={`${pkg.githubUrl}/commit/${latestVersion.githubCommit}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors font-mono"
                      >
                        <ExternalLink className="h-4 w-4" />{' '}
                        {latestVersion.githubCommit.slice(0, 7)}
                      </a>
                    )}
                    <span className="flex items-center gap-2 text-sm text-neutral-400">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                      </div>
                      {(pkg.downloads || 0) > 0
                        ? `${pkg.downloads.toLocaleString()} downloads`
                        : 'Active'}
                    </span>
                  </div>
                </div>

                {allVersions.length > 0 && latestVersion && (
                  <div className="w-full sm:w-auto">
                    <VersionPicker
                      pkgName={pkg.name}
                      currentVersion={latestVersion.version}
                      versions={allVersions.map((v: any) => ({
                        version: v.version,
                        isLatest: allVersions[0].version === v.version,
                      }))}
                    />
                  </div>
                )}
              </div>

              {/* Quick Install CLI Block */}
              <div className="mt-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <AnimatedTerminal
                  command={`skillspace install ${pkg.name}`}
                  output={`Resolving ${pkg.name}...\nFetching capabilities...\nInstalled successfully!`}
                />
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden mb-8">
            <PackageTabs
              pkgName={pkg.name}
              downloads={pkg.downloads || undefined}
              publishedAt={latestVersion?.publishedAt?.toISOString()}
              readmeContent={
                readme ? (
                  <div className="prose prose-invert prose-blue max-w-none p-8">
                    {renderMarkdown(readme)}
                  </div>
                ) : (
                  <div className="p-8">
                    <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                      {pkg.description}
                    </p>

                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                      <Terminal className="w-5 h-5 text-blue-400" /> Installation
                    </h3>
                    <div className="rounded-xl bg-black/60 border border-white/10 p-5 font-mono text-sm shadow-inner text-neutral-300 mb-10 group hover:border-blue-500/30 transition-colors">
                      <code className="flex items-center gap-3">
                        <span className="text-blue-500">$</span> skillspace install {pkg.name}
                      </code>
                    </div>

                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                      <Play className="w-5 h-5 text-emerald-400" /> Usage
                    </h3>
                    <div className="rounded-xl bg-black/60 border border-white/10 p-5 font-mono text-sm shadow-inner text-neutral-300 group hover:border-emerald-500/30 transition-colors">
                      <code className="flex items-center gap-3">
                        <span className="text-emerald-500">$</span> skillspace run {pkg.name}{' '}
                        --input ./src
                      </code>
                    </div>
                  </div>
                )
              }
            />
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-8 mb-8">
            <h2 className="mb-6 text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-400" />
              Versions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-neutral-400 text-sm tracking-wider uppercase">
                    <th className="pb-4 font-semibold px-2">Version</th>
                    <th className="pb-4 font-semibold px-2">Published</th>
                    <th className="pb-4 font-semibold px-2">Source</th>
                    <th className="pb-4 font-semibold px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allVersions.map((v) => (
                    <tr key={v.version} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-2 font-mono text-sm">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/packages/${pkg.name}/${v.version}`}
                            className="text-white font-medium hover:text-blue-400 transition-colors"
                          >
                            v{v.version}
                          </Link>
                          {allVersions.findIndex((ver) => ver.version === v.version) <
                            allVersions.length - 1 && (
                            <Link
                              href={`/packages/${pkg.name}/${v.version}/diff`}
                              className="text-xs text-neutral-500 hover:text-blue-400 transition-colors"
                              title="Compare with previous version"
                            >
                              (diff)
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-neutral-400">
                        {new Date(v.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-2 text-sm">
                        {v.githubCommit ? (
                          <a
                            href={`${pkg.githubUrl || ''}/commit/${v.githubCommit}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-blue-400 transition-colors font-mono"
                            title={v.githubCommit}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {v.githubCommit.slice(0, 7)}
                          </a>
                        ) : (
                          <span className="text-neutral-500 text-xs">registry</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-sm">
                        {v.deprecated ? (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-2 py-1 rounded-md text-xs font-medium">
                            <Shield className="w-3 h-3" /> Deprecated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sticky top-24 h-max w-full space-y-6">
          <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-8">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                  <Box className="h-6 w-6 text-neutral-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-1">
                    Version
                  </div>
                  <div className="font-mono font-semibold text-lg text-white">
                    {latestVersion?.version || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                  <User className="h-6 w-6 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-1">
                    Author
                  </div>
                  <div className="font-semibold text-lg text-white">
                    {pkg.owner?.username || 'skillspace'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                  <Download className="h-6 w-6 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-1">
                    Downloads
                  </div>
                  <div className="font-mono font-semibold text-lg text-white">
                    {pkg.downloads?.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-colors">
                  <Clock className="h-6 w-6 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <div>
                  <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-1">
                    Published
                  </div>
                  <div className="font-semibold text-lg text-white">
                    {latestVersion?.publishedAt
                      ? new Date(latestVersion.publishedAt).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* GitHub Source Card */}
              {githubSourceUrl && (
                <a
                  href={githubSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-neutral-600"
                >
                  <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                    <svg
                      className="h-5 w-5 text-neutral-400 group-hover:text-white transition-colors"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      View Source
                    </div>
                    <div className="text-xs text-neutral-500 font-mono truncate">
                      {pkg.githubUrl}
                    </div>
                  </div>
                  <ExternalLink className="ml-auto h-4 w-4 text-neutral-500" />
                </a>
              )}
            </div>
          </div>

          {latestVersion?.checksum && (
            <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl p-8 group hover:border-green-500/30 transition-colors">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-white text-lg">
                <Shield className="h-5 w-5 text-emerald-400" /> Integrity Check
              </h3>
              <p className="mb-4 text-sm text-neutral-400 leading-relaxed">
                Cryptographic hash ensuring package contents have not been modified or tampered
                with.
              </p>
              <div className="break-all rounded-xl bg-black border border-white/10 p-4 font-mono text-xs text-neutral-300 shadow-inner group-hover:border-green-500/20 transition-colors">
                <code>{latestVersion.checksum}</code>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
