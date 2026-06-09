export const dynamic = 'force-dynamic';
import styles from './page.module.css';
import Link from 'next/link';
import { Package, Shield, RefreshCw, Cpu, BookOpen, Terminal, ChevronRight, Zap, Globe, Layers, Star } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import AnimatedTerminal from '@/components/AnimatedTerminal';
import EmptyState from '@/components/EmptyState';
import { prisma } from '@/lib/prisma';

async function getCommunityStats() {
  try {
    const [skillsCount, usersCount, executionsCount, downloadsResult] = await Promise.all([
      prisma.package.count(),
      prisma.user.count(),
      prisma.executionLog.count(),
      prisma.package.aggregate({
        _sum: {
          downloads: true,
        },
      }),
    ]);
    return { 
      skillsCount, 
      usersCount, 
      executionsCount, 
      downloadsCount: downloadsResult._sum.downloads || 0 
    };
  } catch {
    return { skillsCount: 0, usersCount: 0, executionsCount: 0, downloadsCount: 0 };
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
    <main className={styles.main}>
      <div className={styles.ambientGlow} />
      
      <div className="container">
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>SkillSpace v0.1.0 is live</div>
          <h1 className={styles.heroTitle}>Package AI Skills Like Software.</h1>
          <p className={styles.heroSubtitle}>
            Install, version, share, and run AI capabilities across any model. The open-source registry and runtime for modern AI engineering.
          </p>
          
          <AnimatedTerminal />

          <div className={styles.heroActions}>
            <Link href="/packages" className="btn btnPrimary" style={{ padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)' }}>
              Explore Registry <ChevronRight size={18} />
            </Link>
            <Link href="/docs" className="btn btnSecondary" style={{ padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)' }}>
              <BookOpen size={18} /> Documentation
            </Link>
          </div>
        </section>

        {/* What Is A Skill */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderCentered}>
            <h2 className={styles.sectionTitle}>What is a Skill?</h2>
            <p className={styles.sectionSubtitle}>A reproducible block of AI logic.</p>
          </div>
          <div className={styles.flowchart}>
            <div className={styles.flowNode}>Prompt</div>
            <div className={styles.flowPlus}>+</div>
            <div className={styles.flowNode}>Workflow</div>
            <div className={styles.flowPlus}>+</div>
            <div className={styles.flowNode}>Model Logic</div>
            <div className={styles.flowPlus}>+</div>
            <div className={styles.flowNode}>Versioning</div>
            <div className={styles.flowEquals}>=</div>
            <div className={styles.flowResult}>Skill</div>
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderCentered}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>Ship capabilities in 3 simple steps.</p>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3>Install</h3>
              <code>skillspace install @core/summary</code>
              <p>Add versioned skills to your project securely via CLI.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3>Run</h3>
              <code>skillspace run @core/summary</code>
              <p>Execute locally or on your own infra across any LLM.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3>Publish</h3>
              <code>skillspace publish</code>
              <p>Share your compiled workflows with the community.</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderCentered}>
            <h2 className={styles.sectionTitle}>Why SkillSpace?</h2>
            <p className={styles.sectionSubtitle}>Designed for production AI engineering.</p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={`card ${styles.featureCard}`}>
              <RefreshCw size={24} className={styles.featureIcon} />
              <h3>Write Once</h3>
              <p>Run your skills across Claude, OpenAI, and Ollama instantly.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <Layers size={24} className={styles.featureIcon} />
              <h3>Versioned</h3>
              <p>Predictable releases with explicit semantic versioning.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <Globe size={24} className={styles.featureIcon} />
              <h3>Open Source</h3>
              <p>100% community-driven ecosystem. Build together.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <Terminal size={24} className={styles.featureIcon} />
              <h3>Runtime Powered</h3>
              <p>Consistent execution graphs across all environments.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <Shield size={24} className={styles.featureIcon} />
              <h3>Secure</h3>
              <p>Strict allowlists and governance. Code never leaks.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <Zap size={24} className={styles.featureIcon} />
              <h3>Fast</h3>
              <p>Optimized execution and caching out of the box.</p>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className={styles.statsStrip}>
          <div className={styles.statBox}>
            <div className={styles.statValue}>{stats.skillsCount.toLocaleString()}</div>
            <div className={styles.statLabel}>Total Skills</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <div className={styles.statValue}>{stats.usersCount.toLocaleString()}</div>
            <div className={styles.statLabel}>Contributors</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <div className={styles.statValue}>{stats.downloadsCount.toLocaleString()}</div>
            <div className={styles.statLabel}>Downloads</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <div className={styles.statValue}>{stats.executionsCount.toLocaleString()}</div>
            <div className={styles.statLabel}>Executions</div>
          </div>
        </section>

        {/* Package of the Week */}
        <section className={styles.section} style={{ padding: '4rem 0', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-subtle)', marginBottom: '4rem' }}>
          <div className={styles.sectionHeaderCentered}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              <Star size={14} /> Package of the Week
            </div>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>@core/autonomous-agent</h2>
            <p className={styles.sectionSubtitle}>A fully featured autonomous agent runner with tool use and memory.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <Link href="/packages/autonomous-agent" className="btn btnPrimary">View Package</Link>
          </div>
        </section>

        {/* Featured Packages */}
        <section className={styles.section}>
          <div className={styles.sectionHeaderCentered}>
            <h2 className={styles.sectionTitle}>Trending Skills</h2>
            <p className={styles.sectionSubtitle}>Discover the most popular community capabilities.</p>
          </div>
          {packages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <Globe size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No trending skills yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                The registry is currently empty. Start the ecosystem by publishing the first high-quality skill.
              </p>
              <Link href="/create" className="btn btnSecondary">
                Learn how to publish
              </Link>
            </div>
          ) : (
            <div className={styles.packagesGrid}>
              {packages.map((pkg, i) => (
                <PackageCard key={pkg.name} pkg={pkg as any} index={i} />
              ))}
            </div>
          )}
        </section>

        <section className={styles.finalCta}>
          <h2>Ready to revolutionize your AI workflows?</h2>
          <p>Join the open source ecosystem today.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link href="/create" className="btn btnPrimary" style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)' }}>
              Publish a Skill
            </Link>
            <Link href="/packages" className="btn btnSecondary" style={{ padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)' }}>
              Browse Packages
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
