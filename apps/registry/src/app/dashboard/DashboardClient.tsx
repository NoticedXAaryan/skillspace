'use client';

import { useState } from 'react';
import styles from './Dashboard.module.css';
import { Settings, Package, MessageSquare, AlertCircle, TrendingUp, DollarSign, Edit3, Trash2, Star } from 'lucide-react';

type PackageData = {
  id: string;
  name: string;
  version: string;
  downloads: number;
  stars: number;
  publishedAt: Date | string;
};

type DashboardData = {
  packages: PackageData[];
  user: {
    username: string;
  }
};

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState('packages');

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Maintainer Portal</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{data.user.username}</p>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.navItem} ${activeTab === 'packages' ? styles.active : ''}`} onClick={() => setActiveTab('packages')}>
            <Package size={18} /> My Packages <span className={styles.badge}>{data.packages.length}</span>
          </button>
          <button className={`${styles.navItem} ${activeTab === 'issues' ? styles.active : ''}`} onClick={() => setActiveTab('issues')}>
            <AlertCircle size={18} /> Issues
          </button>
          <button className={`${styles.navItem} ${activeTab === 'reviews' ? styles.active : ''}`} onClick={() => setActiveTab('reviews')}>
            <MessageSquare size={18} /> Reviews
          </button>
          <button className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`} onClick={() => setActiveTab('analytics')}>
            <TrendingUp size={18} /> Analytics
          </button>
          <button className={`${styles.navItem} ${activeTab === 'bounties' ? styles.active : ''}`} onClick={() => setActiveTab('bounties')}>
            <DollarSign size={18} /> Bounties
          </button>
          <button className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {activeTab === 'packages' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1>My Packages</h1>
              <button className="btn btnPrimary">Publish New</button>
            </div>
            
            <div className={styles.packageList}>
              {data.packages.length === 0 ? (
                <div className={styles.emptyState}>
                  <Package size={48} />
                  <h3>No packages yet</h3>
                  <p>You haven't published any skills to the registry.</p>
                </div>
              ) : (
                data.packages.map((pkg) => (
                  <div key={pkg.id} className={styles.packageCard}>
                    <div className={styles.pkgInfo}>
                      <h3>{pkg.name}</h3>
                      <p>{pkg.version} • Published {new Date(pkg.publishedAt).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.pkgMetrics}>
                      <span><TrendingUp size={14}/> {pkg.downloads.toLocaleString()}</span>
                      <span><Star size={14}/> {pkg.stars.toLocaleString()}</span>
                    </div>
                    <div className={styles.pkgActions}>
                      <button className={styles.iconBtn} title="Edit"><Edit3 size={16} /></button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1>Open Issues</h1>
            </div>
            <div className={styles.emptyState}>
              <AlertCircle size={48} />
              <h3>No critical issues</h3>
              <p>Your packages are running smoothly across the ecosystem.</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1>Community Reviews</h1>
            </div>
            <div className={styles.emptyState}>
                <MessageSquare size={48} />
                <h3>No new reviews</h3>
                <p>Check back later for community feedback.</p>
            </div>
          </div>
        )}

        {(activeTab === 'analytics' || activeTab === 'bounties' || activeTab === 'settings') && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            </div>
            <div className={styles.emptyState}>
              <Settings size={48} />
              <h3>Under Construction</h3>
              <p>This maintainer feature is rolling out in the next Phase.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
