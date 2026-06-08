import styles from './Collections.module.css';
import { Package, Download, Star, ExternalLink, Library } from 'lucide-react';
import Link from 'next/link';
import examplesData from '@/data/examples.json';

export const metadata = {
  title: 'Collections — SkillSpace',
  description: 'Curated lists of the best AI capabilities.',
};

export default function CollectionsPage() {
  // Group examples by category for the collections
  const grouped = examplesData.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {} as Record<string, typeof examplesData>);

  return (
    <main className="container">
      <div className={styles.header}>
        <h1><Library className={styles.headerIcon} /> Curated Collections</h1>
        <p>Discover the highest-rated capabilities grouped by use-case.</p>
      </div>

      <div className={styles.collectionsWrap}>
        {Object.keys(grouped).map(category => (
          <div key={category} className={styles.collectionSection}>
            <div className={styles.sectionHeader}>
              <h2>Top {category} Skills</h2>
              <Link href={`/examples?category=${category}`} className={styles.viewAll}>
                View all {grouped[category].length} <ExternalLink size={14} />
              </Link>
            </div>
            
            <div className={styles.grid}>
              {grouped[category].slice(0, 3).map((ex: any) => (
                <div key={ex.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.titleRow}>
                      <h3>{ex.name}</h3>
                      <div className={styles.stats}>
                        <span><Download size={12} /> {ex.downloads.toLocaleString()}</span>
                        <span><Star size={12} /> {ex.stars.toLocaleString()}</span>
                      </div>
                    </div>
                    <Link href={`/packages/${ex.name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.authorLink}>
                      @{ex.author}
                    </Link>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.installBox}>
                      <code>{ex.installCmd}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
