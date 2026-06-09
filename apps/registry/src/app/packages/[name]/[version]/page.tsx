import VersionPicker from '@/components/VersionPicker';
import InstallCard from '@/components/InstallCard';
import { Shield, Download, Clock, User, Box } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ name: string, version: string }> }) {
  const { name, version } = await params;
  const pkg = await prisma.package.findUnique({ where: { name } });
  return {
    title: pkg ? `${pkg.name} v${version} — SkillSpace` : 'Version Not Found — SkillSpace',
    description: pkg?.description || `Version ${version} of ${name} on SkillSpace.`,
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
          <div key={`code-${i}`} className="my-6 overflow-x-auto rounded-md bg-zinc-950 p-4 font-mono text-sm shadow-sm">
            <pre className="m-0 text-zinc-300"><code>{codeContent.join('\n')}</code></pre>
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

export default async function PackageVersionPage({ params }: { params: Promise<{ name: string, version: string }> }) {
  const { name, version } = await params;
  
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

  const targetVersion = pkg.versions.find(v => v.version === version);

  if (!targetVersion) {
    return (
      <main className="container mx-auto px-4 py-32 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Version Not Found</h1>
        <p className="text-lg text-muted-foreground">
          Version "{version}" for "{name}" doesn't exist.
        </p>
        <Link href={`/packages/${name}`} className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
          ← View Latest Version
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
  const isLatest = allVersions[0]?.version === version;

  const readme = targetVersion.manifest ? extractReadme(targetVersion.manifest as string) : null;

  return (
    <main className="container mx-auto px-4 py-12 pb-24">
      {!isLatest && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
          <span className="text-sm font-medium text-amber-600">
            <strong>Note:</strong> You are viewing an older version of this package.
          </span>
          <Link href={`/packages/${name}`} className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
            Go to latest (v{allVersions[0]?.version})
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_300px]">
        {/* Main Content */}
        <div className="min-w-0">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm border-t-4 border-t-foreground">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-foreground">
                  {pkg.name} <span className="text-2xl font-normal text-muted-foreground">v{version}</span>
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
              </div>
              
              {allVersions.length > 0 && (
                <VersionPicker 
                  pkgName={pkg.name}
                  currentVersion={version}
                  versions={allVersions.map((v: any) => ({
                    version: v.version,
                    isLatest: allVersions[0].version === v.version
                  }))}
                />
              )}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-8 shadow-sm">
            <h2 className="mb-6 border-b border-border pb-4 text-2xl font-bold text-foreground">
              Documentation
            </h2>
            <div className="text-muted-foreground">
              {readme ? (
                renderMarkdown(readme)
              ) : (
                <>
                  <p>{pkg.description}</p>
                  
                  <h3 className="mb-4 mt-8 text-xl font-bold text-foreground">Installation</h3>
                  <div className="rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-300 shadow-sm">
                    <code>skillspace install {pkg.name}@{version}</code>
                  </div>

                  <h3 className="mb-4 mt-8 text-xl font-bold text-foreground">Usage</h3>
                  <div className="rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-300 shadow-sm">
                    <code>skillspace run {pkg.name}@{version} --input ./src</code>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="sticky top-24 h-max w-full">
          <InstallCard pkgName={`${pkg.name}@${version}`}>
            <div className="flex flex-col gap-5 mt-6 border-t border-border pt-6">
              <div className="flex items-center gap-4">
                <Box className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Version</div>
                  <div className="font-semibold text-foreground">{version}</div>
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
                    {targetVersion?.publishedAt ? new Date(targetVersion.publishedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </InstallCard>

          {targetVersion?.checksum && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
                <Shield className="h-5 w-5 text-green-500" /> Integrity
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                Cryptographic hash ensuring package contents have not been modified.
              </p>
              <div className="break-all rounded-md bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
                <code>{targetVersion.checksum}</code>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
