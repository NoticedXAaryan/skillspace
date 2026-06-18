import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PackageVersionDiffPage({
  params,
}: {
  params: Promise<{ name: string; version: string }>;
}) {
  const { name, version } = await params;

  const pkg = await prisma.package.findUnique({
    where: { name },
    include: {
      versions: {
        orderBy: { publishedAt: 'desc' },
      },
    },
  });

  if (!pkg) {
    notFound();
  }

  // Find the requested version
  const currentVersionIndex = pkg.versions.findIndex((v) => v.version === version);
  if (currentVersionIndex === -1) {
    notFound();
  }

  const currentVersion = pkg.versions[currentVersionIndex];
  
  // Previous version is the one immediately following the current in the desc ordered array
  const previousVersion = pkg.versions[currentVersionIndex + 1];

  if (!previousVersion) {
    return (
      <main className="container mx-auto px-4 py-32 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">No Previous Version</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Version {version} is the first version of {name}. There is no prior version to diff against.
        </p>
        <Link
          href={`/packages/${name}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Package
        </Link>
      </main>
    );
  }

  const currentManifest = (currentVersion.manifest as string) || '';
  const previousManifest = (previousVersion.manifest as string) || '';

  // Very simple line comparison
  const prevLines = previousManifest.split('\n');
  const currLines = currentManifest.split('\n');
  
  const diffResult = [];
  let p = 0, c = 0;
  
  while (p < prevLines.length || c < currLines.length) {
    if (p < prevLines.length && c < currLines.length && prevLines[p] === currLines[c]) {
      diffResult.push({ added: false, removed: false, value: prevLines[p] + '\n' });
      p++; c++;
    } else if (c < currLines.length && !prevLines.includes(currLines[c])) {
      diffResult.push({ added: true, removed: false, value: currLines[c] + '\n' });
      c++;
    } else if (p < prevLines.length && !currLines.includes(prevLines[p])) {
      diffResult.push({ added: false, removed: true, value: prevLines[p] + '\n' });
      p++;
    } else {
      // both exist but out of order, let's treat as changed
      if (p < prevLines.length) {
        diffResult.push({ added: false, removed: true, value: prevLines[p] + '\n' });
        p++;
      }
      if (c < currLines.length) {
        diffResult.push({ added: true, removed: false, value: currLines[c] + '\n' });
        c++;
      }
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href={`/packages/${name}`}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Manifest Diff</h1>
          <p className="text-neutral-400 font-mono text-sm">
            {name}: v{previousVersion.version} → v{currentVersion.version}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden font-mono text-sm">
        <div className="p-4 bg-white/5 border-b border-white/10 text-neutral-400 flex items-center justify-between">
          <span>{name}/skill.yaml</span>
          <span className="text-xs">
            Showing changes from <span className="text-rose-400">v{previousVersion.version}</span> to <span className="text-emerald-400">v{currentVersion.version}</span>
          </span>
        </div>
        <div className="p-6 overflow-x-auto">
          <pre className="text-neutral-300">
            {diffResult.map((part, index) => {
              if (part.added) {
                return (
                  <div key={index} className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded -mx-2">
                    {part.value.split('\n').map((line, i, arr) => 
                      i < arr.length - 1 || line ? <div key={i}>+ {line}</div> : null
                    )}
                  </div>
                );
              }
              if (part.removed) {
                return (
                  <div key={index} className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded -mx-2">
                    {part.value.split('\n').map((line, i, arr) => 
                      i < arr.length - 1 || line ? <div key={i}>- {line}</div> : null
                    )}
                  </div>
                );
              }
              return (
                <div key={index} className="text-neutral-500 px-2 py-0.5 opacity-50">
                  {part.value.split('\n').map((line, i, arr) => 
                    i < arr.length - 1 || line ? <div key={i}>  {line}</div> : null
                  )}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </main>
  );
}
