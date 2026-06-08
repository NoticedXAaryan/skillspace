import styles from './page.module.css';
import Link from 'next/link';
import { Package, Shield, RefreshCw, Cpu, BookOpen, Terminal, ChevronRight } from 'lucide-react';
import PackageCard from '@/components/PackageCard';

interface PackageData {
  name: string;
  description: string;
  downloads: number;
  latestVersion?: string;
  tags: string[];
  owner?: { username: string };
  type?: string;
}

async function getFeaturedPackages(): Promise<PackageData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/packages?limit=6`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const packages = await getFeaturedPackages();

  return (
    <main className={styles.main}>
      {/* Dynamic Background */}
      <div className={styles.ambientGlow} />
      
      <div className="container">
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            SkillSpace v0.1.0 is live
          </div>
          
          <h1 className={styles.heroTitle}>
            The Universal Runtime & Registry for AI Capabilities
          </h1>
          <p className={styles.heroSubtitle}>
            Install, share, version, and execute AI skills, agents, and workflows. Stop rebuilding prompts from scratch. Ship AI features with the predictability of software packages.
          </p>

          <div className={styles.heroActions}>
            <div className={styles.installSnippet}>
              <Terminal size={16} className={styles.snippetIcon} />
              <span>skillspace install security-review</span>
            </div>
            <Link href="/docs" className="btn btnSecondary">
              <BookOpen size={16} />
              Read the Docs
            </Link>
          </div>
        </section>

        {/* Stats Strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statBox}>
            <div className={styles.statValue}>Cross-Model</div>
            <div className={styles.statLabel}>Claude, GPT-4, Gemini</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <div className={styles.statValue}>&lt;5s</div>
            <div className={styles.statLabel}>Avg. Install Time</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBox}>
            <div className={styles.statValue}>100%</div>
            <div className={styles.statLabel}>Reproducible Workflows</div>
          </div>
        </div>

        {/* Features Grid */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Why SkillSpace?</h2>
              <p className={styles.sectionSubtitle}>Designed for production AI engineering.</p>
            </div>
          </div>
          
          <div className={styles.featuresGrid}>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper}>
                <RefreshCw size={16} />
              </div>
              <h3>Write Once, Run Anywhere</h3>
              <p>The Model Adapter Layer instantly translates your skills across Claude, OpenAI, and Ollama without code changes.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper}>
                <Shield size={16} />
              </div>
              <h3>Secure by Default</h3>
              <p>Every skill declares explicit permissions. The runtime enforces boundaries, ensuring skills can never access unauthorized files or networks.</p>
            </div>
            <div className={`card ${styles.featureCard}`}>
              <div className={styles.featureIconWrapper}>
                <Package size={16} />
              </div>
              <h3>Versioned & Reproducible</h3>
              <p>Generate lock files for your AI workflows. Your entire team gets the exact same capability stack on day one.</p>
            </div>
          </div>
        </section>

        {/* Featured Packages */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Capabilities</h2>
            <Link href="/packages" className={styles.viewAllLink}>
              View Registry <ChevronRight size={16} />
            </Link>
          </div>

          {packages.length === 0 ? (
            <div className={styles.emptyState}>
              <Cpu size={32} className={styles.emptyIcon} />
              <h3>No packages found</h3>
              <p>The registry is currently empty. Be the first to publish a skill!</p>
              <Link href="/docs/publishing" className="btn btnSecondary" style={{ marginTop: '1rem' }}>
                Learn how to publish
              </Link>
            </div>
          ) : (
            <div className={styles.packagesGrid}>
              {packages.map((pkg, i) => (
                <PackageCard key={pkg.name} pkg={pkg} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
