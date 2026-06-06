import styles from './page.module.css';

interface PackageData {
  name: string;
  description: string;
  downloads: number;
  latestVersion?: string;
  tags: string[];
  owner?: { username: string };
}

async function getFeaturedPackages(): Promise<PackageData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/packages?limit=6`, {
      cache: 'no-store',
    });
    if (!res.ok) return getSeedPackages();
    const data = await res.json();
    return data.data?.length > 0 ? data.data : getSeedPackages();
  } catch {
    return getSeedPackages();
  }
}

function getSeedPackages(): PackageData[] {
  return [
    {
      name: 'security-review',
      description: 'Analyze code for security vulnerabilities using OWASP Top 10',
      downloads: 12450,
      latestVersion: '2.1.0',
      tags: ['security', 'code-review'],
    },
    {
      name: 'code-documenter',
      description: 'Generate comprehensive documentation from source code',
      downloads: 8320,
      latestVersion: '1.4.2',
      tags: ['documentation', 'code'],
    },
    {
      name: 'api-designer',
      description: 'Design RESTful APIs with OpenAPI spec generation',
      downloads: 6780,
      latestVersion: '3.0.1',
      tags: ['api', 'design', 'openapi'],
    },
    {
      name: 'test-generator',
      description: 'Automatically generate unit and integration test suites',
      downloads: 5190,
      latestVersion: '1.2.0',
      tags: ['testing', 'automation'],
    },
    {
      name: 'pr-reviewer',
      description: 'AI-powered pull request review with actionable feedback',
      downloads: 4620,
      latestVersion: '2.0.3',
      tags: ['code-review', 'devops'],
    },
    {
      name: 'sql-optimizer',
      description: 'Optimize SQL queries for performance and readability',
      downloads: 3840,
      latestVersion: '1.1.0',
      tags: ['sql', 'performance'],
    },
  ];
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default async function HomePage() {
  const packages = await getFeaturedPackages();

  return (
    <main>
      <div className="container">
        {/* Hero */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            The Package Manager for{' '}
            <span className={styles.gradientText}>AI Capabilities</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Install, share, version, and execute AI skills the same way you manage
            software packages. Cross-model. Reproducible. Secure.
          </p>

          <div className={styles.searchContainer}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search skills, agents, and workflows..."
            />
          </div>

          <div className={styles.installSnippet}>
            <span className={styles.installPrefix}>$</span>
            skillspace install security-review
          </div>
        </section>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>50+</div>
            <div className={styles.statLabel}>Skills Available</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>4</div>
            <div className={styles.statLabel}>Model Providers</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>&lt;5s</div>
            <div className={styles.statLabel}>Install Time</div>
          </div>
        </div>

        {/* Featured Packages */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Featured Skills</h2>
          <div className={styles.grid}>
            {packages.map((pkg, i) => (
              <a
                key={pkg.name}
                href={`/packages/${pkg.name}`}
                className={styles.packageCard}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="card">
                  <div className={styles.packageName}>
                    {pkg.name}
                    {pkg.latestVersion && (
                      <span className={styles.packageVersion}>v{pkg.latestVersion}</span>
                    )}
                  </div>
                  <p className={styles.packageDescription}>{pkg.description}</p>
                  <div className={styles.tagsRow}>
                    {pkg.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className={styles.packageMeta}>
                    <span className={styles.packageAuthor}>
                      {(pkg as { owner?: { username: string } }).owner?.username || 'skillspace'}
                    </span>
                    <span className={styles.packageDownloads}>
                      ↓ {formatDownloads(pkg.downloads)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className={styles.sectionTitle}>Why SkillSpace?</h2>
          <div className={styles.features}>
            <div className="card">
              <div className={styles.featureIcon}>🔄</div>
              <div className={styles.featureTitle}>Cross-Model Portable</div>
              <p className={styles.featureDesc}>
                Write once, run on Claude, GPT-4, Gemini, or Ollama. The Model Adapter
                Layer handles the translation.
              </p>
            </div>
            <div className="card">
              <div className={styles.featureIcon}>🔒</div>
              <div className={styles.featureTitle}>Secure by Default</div>
              <p className={styles.featureDesc}>
                Every skill declares permissions explicitly. No skill can exceed what
                it&apos;s granted. API keys never leave the runtime.
              </p>
            </div>
            <div className="card">
              <div className={styles.featureIcon}>📦</div>
              <div className={styles.featureTitle}>Versioned &amp; Reproducible</div>
              <p className={styles.featureDesc}>
                Lock files, checksums, and semver ranges. Your team gets the exact same
                capabilities on every machine.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
