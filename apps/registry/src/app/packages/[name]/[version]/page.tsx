import styles from '../../../page.module.css';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import VersionPicker from '@/components/VersionPicker';
import { Terminal, Shield, Download, Clock, User, Box } from 'lucide-react';

export default async function PackageVersionPage({ params }: { params: Promise<{ name: string; version: string }> }) {
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

  const currentVersion = pkg.versions.find(v => v.version === version);

  if (!currentVersion) {
    notFound();
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(pkg.tags as string);
    if (!Array.isArray(tags)) tags = [];
  } catch {
    tags = [];
  }

  return (
    <main className="container" style={{ padding: '2rem 1.5rem 6rem' }}>
      {/* Banner support: if a package specifies a banner URL, we render it */}
      {(pkg as any).bannerUrl && (
        <div style={{
          width: '100%', height: '240px', borderRadius: 'var(--radius-lg)',
          backgroundImage: `url(${(pkg as any).bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
          marginBottom: '2rem', border: '1px solid var(--border)'
        }} />
      )}

      <div className={styles.layout}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className="card" style={{ padding: '2.5rem', borderTop: '4px solid var(--gradient-start)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                  {pkg.name}
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '600px' }}>
                  {pkg.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  {tags.map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                  {pkg.type && <span className="tag" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>{pkg.type}</span>}
                </div>
              </div>
              
              <VersionPicker 
                pkgName={pkg.name}
                currentVersion={currentVersion.version}
                versions={pkg.versions.map(v => ({
                  version: v.version,
                  isLatest: pkg.versions[0].version === v.version
                }))}
              />
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              Documentation
            </h2>
            <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              <p>Documentation for <strong>{pkg.name}@{currentVersion.version}</strong> will appear here when published with a README.md file. Use the following commands to get started immediately.</p>
              
              <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>Installation</h3>
              <div className="codeBlock">
                <code>skillspace install {pkg.name}@{currentVersion.version}</code>
              </div>

              <h3 style={{ color: '#fff', marginTop: '2rem', marginBottom: '1rem' }}>Usage</h3>
              <div className="codeBlock">
                <code>skillspace run {pkg.name} --input ./src</code>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className="card">
            <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} color="var(--accent)" /> Quick Install
            </h3>
            <div className="codeBlock" style={{ marginBottom: '2rem' }}>
              <code>skillspace install {pkg.name}@{currentVersion.version}</code>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Box size={20} color="var(--text-muted)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Version</div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{currentVersion.version}</div>
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
                    {new Date(currentVersion.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentVersion.checksum && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--success)" /> Integrity
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Cryptographic hash ensuring package contents have not been modified.
              </p>
              <div className="codeBlock" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                <code>{currentVersion.checksum}</code>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
