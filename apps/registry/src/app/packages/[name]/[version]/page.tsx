import styles from '../../../page.module.css';
import VersionPicker from '@/components/VersionPicker';
import InstallCard from '@/components/InstallCard';
import { Shield, Download, Clock, User, Box } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

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
          <div key={`code-${i}`} className="codeBlock" style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            <pre style={{ margin: 0 }}><code>{codeContent.join('\n')}</code></pre>
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
      elements.push(<h4 key={i} style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '0.75rem' }}>{line.slice(4)}</h4>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={i} style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>{line.slice(3)}</h3>);
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} style={{ color: '#fff', marginTop: '2.5rem', marginBottom: '1.25rem', fontSize: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>{line.slice(2)}</h2>);
      continue;
    }
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '0.75rem' }} />);
      continue;
    }
    
    // Inline code replacement
    const parts = line.split(/(`[^`]+`)/g);
    elements.push(
      <p key={i} style={{ marginBottom: '0.5rem', lineHeight: '1.6' }}>
        {parts.map((part, j) => 
          part.startsWith('`') && part.endsWith('`') ? 
            <code key={j} style={{ background: 'var(--bg-elevated)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.85em', color: 'var(--text-primary)' }}>{part.slice(1, -1)}</code> 
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
      <main className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>Package Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          The capability &quot;{name}&quot; doesn&apos;t exist in the registry.
        </p>
        <Link href="/" className="btn btnPrimary" style={{ marginTop: '2rem' }}>
          ← Back to Registry
        </Link>
      </main>
    );
  }

  const targetVersion = pkg.versions.find(v => v.version === version);

  if (!targetVersion) {
    return (
      <main className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>Version Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Version &quot;{version}&quot; for &quot;{name}&quot; doesn&apos;t exist.
        </p>
        <Link href={`/packages/${name}`} className="btn btnPrimary" style={{ marginTop: '2rem' }}>
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
    <main className="container" style={{ padding: '2rem 1.5rem 6rem' }}>
      {!isLatest && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#f59e0b', fontSize: '0.9rem' }}>
            <strong>Note:</strong> You are viewing an older version of this package.
          </span>
          <Link href={`/packages/${name}`} className="btn btnSecondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
            Go to latest (v{allVersions[0]?.version})
          </Link>
        </div>
      )}

      <div className={styles.layout} style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className="card" style={{ padding: '2.5rem', borderTop: '4px solid var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  {pkg.name} <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', fontWeight: 400 }}>v{version}</span>
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '600px' }}>
                  {pkg.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  {tags.map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                  {(pkg as any).type && <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>{(pkg as any).type}</span>}
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

          <div className="card" style={{ marginTop: '2rem', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              Documentation
            </h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              {readme ? (
                renderMarkdown(readme)
              ) : (
                <>
                  <p>{pkg.description}</p>
                  
                  <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>Installation</h3>
                  <div className="codeBlock">
                    <code>skillspace install {pkg.name}@{version}</code>
                  </div>

                  <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>Usage</h3>
                  <div className="codeBlock">
                    <code>skillspace run {pkg.name}@{version} --input ./src</code>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <InstallCard pkgName={`${pkg.name}@${version}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Box size={20} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Version</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{version}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <User size={20} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Author</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{pkg.owner?.username || 'skillspace'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Download size={20} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Downloads</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{pkg.downloads?.toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Clock size={20} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Published</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>
                    {targetVersion?.publishedAt ? new Date(targetVersion.publishedAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </InstallCard>

          {targetVersion?.checksum && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--success)" /> Integrity
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Cryptographic hash ensuring package contents have not been modified.
              </p>
              <div className="codeBlock" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                <code>{targetVersion.checksum}</code>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
