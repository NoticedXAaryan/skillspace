import Link from 'next/link';
import { ArrowDownToLine } from 'lucide-react';
import styles from './PackageCard.module.css';

interface PackageData {
  name: string;
  description: string;
  downloads: number;
  latestVersion?: string;
  tags: string[];
  owner?: { username: string };
  type?: string;
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function PackageCard({ pkg, index = 0, compact = false }: { pkg: PackageData, index?: number, compact?: boolean }) {
  return (
    <Link
      href={`/packages/${pkg.name}`}
      className={`card ${styles.packageCard}`}
      style={{ animationDelay: `${index * 40}ms`, padding: compact ? 'var(--space-4)' : undefined }}
    >
      <div className={styles.packageHeader}>
        <div className={styles.packageTitleRow}>
          <span className={styles.packageName}>{pkg.name}</span>
          {pkg.latestVersion && (
            <span className={styles.versionTag}>v{pkg.latestVersion}</span>
          )}
        </div>
        {pkg.type && <span className={styles.typeBadge}>{pkg.type}</span>}
      </div>
      
      <p className={styles.packageDesc}>{pkg.description}</p>
      
      <div className={styles.tagsRow}>
        {pkg.tags?.slice(0, 3).map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      
      <div className={styles.packageFooter}>
        <div className={styles.packageAuthor}>
          <div className={styles.authorAvatar}>
            {pkg.owner?.username?.[0]?.toUpperCase() || 'S'}
          </div>
          {pkg.owner?.username || 'skillspace'}
        </div>
        <div className={styles.packageStats}>
          <span className={styles.downloads}>
            <ArrowDownToLine size={14} className={styles.inlineIcon} /> 
            {formatDownloads(pkg.downloads)}
          </span>
        </div>
      </div>
    </Link>
  );
}
