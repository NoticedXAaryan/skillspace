import styles from './page.module.css';

async function getPackage(name: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/packages/${name}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export default async function PackagePage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const pkg = await getPackage(name);

  if (!pkg) {
    return (
      <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Package Not Found</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          The package &quot;{name}&quot; doesn&apos;t exist in the registry.
        </p>
        <a href="/" className="btn btnPrimary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
          ← Back to Home
        </a>
      </main>
    );
  }

  const tags = Array.isArray(pkg.tags) ? pkg.tags : [];
  const latestVersion = pkg.latestVersion;

  return (
    <main className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <div className={styles.layout}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={`card ${styles.header}`}>
            <h1 className={styles.packageName}>{pkg.name}</h1>
            <p className={styles.description}>{pkg.description}</p>
            <div className={styles.tagsRow}>
              {tags.map((tag: string) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className={`card ${styles.readme}`}>
            <h2 className={styles.sectionTitle}>README</h2>
            <div className={styles.readmeContent}>
              <p>Documentation for <strong>{pkg.name}</strong> will appear here when published with a README.md file.</p>
              <br />
              <h3>Quick Start</h3>
              <div className="codeBlock">
                <code>skillspace install {pkg.name}</code>
              </div>
              <br />
              <div className="codeBlock">
                <code>skillspace run {pkg.name} --input ./src</code>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className="card">
            <h3 className={styles.sidebarTitle}>Install</h3>
            <div className="codeBlock" style={{ marginBottom: '1.5rem' }}>
              <code>skillspace install {pkg.name}</code>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Version</span>
                <span className={styles.metaValue}>{latestVersion?.version || 'N/A'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Author</span>
                <span className={styles.metaValue}>{pkg.owner?.username || 'unknown'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Downloads</span>
                <span className={styles.metaValue}>{pkg.downloads?.toLocaleString()}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Type</span>
                <span className={styles.metaValue}>{pkg.type}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Published</span>
                <span className={styles.metaValue}>
                  {latestVersion?.publishedAt
                    ? new Date(latestVersion.publishedAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {latestVersion?.checksum && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <h3 className={styles.sidebarTitle}>Integrity</h3>
              <div className="codeBlock" style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                <code>{latestVersion.checksum}</code>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
