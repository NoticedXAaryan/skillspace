import VersionPicker from '@/components/VersionPicker';
import InstallCard from '@/components/InstallCard';
import { Shield, Download, Clock, User, Box, Terminal } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import PackageTabs from './PackageTabs';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const pkg = await prisma.package.findUnique({ where: { name } });
  return {
    title: pkg ? `${pkg.name} — SkillSpace` : 'Package Not Found — SkillSpace',
    description: pkg?.description || 'View capabilities on the SkillSpace registry.',
  };
}

function extractReadme(manifestYaml: string): string | null {
  if (!manifestYaml) return null;
  const readmeMatch = manifestYaml.match(/readme:\s*\|-?\n([\s\S]*?)(?=\n[a-z_]+:|$)/i);
  if (readmeMatch) {
    const lines = readmeMatch[1].split('\n');
    return lines.map(l => l.replace(/^ {2}/, '')).join('\n');
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
          <div key={`code-${i}`} className="my-6 rounded-md bg-zinc-950 p-4 font-mono text-sm shadow-sm overflow-x-auto">
            <pre className="text-zinc-300"><code>{codeContent.join('\n')}</code></pre>
          </div>
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
      elements.push(<h4 key={i} className="mt-6 mb-3 text-lg font-semibold text-foreground">{line.slice(4)}</h4>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="mt-8 mb-4 text-xl font-bold text-foreground">{line.slice(3)}</h3>);
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="mt-10 mb-5 border-b border-border pb-2 text-2xl font-bold text-foreground">{line.slice(2)}</h2>);
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
          part.startsWith('`') && part.endsWith('`') ? 
            <code key={j} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{part.slice(1, -1)}</code> 
          : part
        )}
      </p>
    );
  }
  return elements;
}

export default async function PackagePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  
  const pkg = await prisma.package.findUnique({
    where: { name },
    include: {
      owner: { select: { id: true, username: true } },
      versions: { orderBy: { publishedAt: 'desc' } }
    }
  });

  if (!pkg) {
    return (
      <main className="container mx-auto px-4 py-32 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Package Not Found</h1>
        <p className="text-lg text-muted-foreground">
          The capability "{name}" doesn't exist in the registry.
        </p>
        <Link href="/" className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
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

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="min-w-0">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="border-t-4 border-t-foreground rounded-t-xl p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground">
                    {pkg.name}
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    {pkg.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                    {(pkg as any).type && (
                      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 border">
                        {(pkg as any).type}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    {pkg.verified && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-green-500">
                        <Shield className="h-4 w-4" /> Verified Publisher
                      </span>
                    )}
                    {!pkg.isPrivate && (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-blue-500">
                        <Box className="h-4 w-4" /> Open Source
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span> Health: 98/100
                    </span>
                  </div>
                </div>
                
                {allVersions.length > 0 && latestVersion && (
                  <VersionPicker 
                    pkgName={pkg.name}
                    currentVersion={latestVersion.version}
                    versions={allVersions.map((v: any) => ({
                      version: v.version,
                      isLatest: allVersions[0].version === v.version
                    }))}
                  />
                )}
              </div>
              
              {/* Quick Install CLI Block */}
              <div className="mt-10 flex items-center justify-between rounded-lg border border-border bg-black/80 px-6 py-4 shadow-inner">
                <div className="flex items-center gap-4 font-mono text-sm text-zinc-300">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span>air install <span className="text-primary">{pkg.name}</span></span>
                </div>
                <InstallCard pkgName={pkg.name} />
              </div>
            </div>
          </div>

          <PackageTabs 
            pkgName={pkg.name}
            readmeContent={
              readme ? (
                renderMarkdown(readme)
              ) : (
                <>
                  <p className="text-muted-foreground">{pkg.description}</p>
                  
                  <h3 className="mb-4 mt-8 text-xl font-bold text-foreground">Installation</h3>
                  <div className="rounded-md bg-zinc-950 p-4 font-mono text-sm shadow-sm text-zinc-300">
                    <code>skillspace install {pkg.name}</code>
                  </div>

                  <h3 className="mb-4 mt-8 text-xl font-bold text-foreground">Usage</h3>
                  <div className="rounded-md bg-zinc-950 p-4 font-mono text-sm shadow-sm text-zinc-300">
                    <code>skillspace run {pkg.name} --input ./src</code>
                  </div>
                </>
              )
            }
          />

          <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-6 border-b border-border pb-4 text-2xl font-bold text-foreground">
              Versions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="pb-3 font-medium">Version</th>
                    <th className="pb-3 font-medium">Published</th>
                    <th className="pb-3 font-medium">Deprecated</th>
                  </tr>
                </thead>
                <tbody>
                  {allVersions.map(v => (
                    <tr key={v.version} className="border-b border-border last:border-0">
                      <td className="py-3 font-mono text-sm">
                        <Link href={`/packages/${pkg.name}/${v.version}`} className="text-foreground hover:underline">
                          v{v.version}
                        </Link>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {new Date(v.publishedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm">
                        {v.deprecated ? <span className="text-destructive">⚠ deprecated</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sticky top-24 h-max w-full">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <Box className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Version</div>
                  <div className="font-semibold text-foreground">{latestVersion?.version || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Author</div>
                  <div className="font-semibold text-foreground">{pkg.owner?.username || 'skillspace'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Download className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Downloads</div>
                  <div className="font-semibold text-foreground">{pkg.downloads?.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Published</div>
                  <div className="font-semibold text-foreground">
                    {latestVersion?.publishedAt ? new Date(latestVersion.publishedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {latestVersion?.checksum && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
                <Shield className="h-5 w-5 text-green-500" /> Integrity
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Cryptographic hash ensuring package contents have not been modified.
              </p>
              <div className="break-all rounded-md bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
                <code>{latestVersion.checksum}</code>
              </div>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-16 border-t border-border pt-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground">Similar Skills</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/packages/vision-parser" className="block">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-muted-foreground">
              <h3 className="mb-2 font-semibold text-foreground">vision-parser</h3>
              <p className="mb-4 text-sm text-muted-foreground">A robust computer vision tool for extracting text.</p>
              <div className="text-xs text-muted-foreground"><Download className="inline-block h-3 w-3 mr-1"/> 1.2k</div>
            </div>
          </Link>
          <Link href="/packages/document-qa" className="block">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-muted-foreground">
              <h3 className="mb-2 font-semibold text-foreground">document-qa</h3>
              <p className="mb-4 text-sm text-muted-foreground">Question answering over large PDF documents.</p>
              <div className="text-xs text-muted-foreground"><Download className="inline-block h-3 w-3 mr-1"/> 8.4k</div>
            </div>
          </Link>
          <Link href="/packages/text-to-sql" className="block">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-muted-foreground">
              <h3 className="mb-2 font-semibold text-foreground">text-to-sql</h3>
              <p className="mb-4 text-sm text-muted-foreground">Translate natural language queries into SQL.</p>
              <div className="text-xs text-muted-foreground"><Download className="inline-block h-3 w-3 mr-1"/> 3.1k</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
