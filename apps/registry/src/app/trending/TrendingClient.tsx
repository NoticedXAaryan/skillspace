'use client';

import { useState } from 'react';
import styles from './Trending.module.css';
import { Flame, ArrowUpRight, Download, Star } from 'lucide-react';
import Link from 'next/link';

type PackageItem = {
  id: string;
  name: string;
  author: string;
  downloads: number;
  stars: number;
};

type TrendingData = {
  today: PackageItem[];
  week: PackageItem[];
  month: PackageItem[];
  allTime: PackageItem[];
};

export default function TrendingClient({ data }: { data: TrendingData }) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'allTime'>('today');

  const currentList = data[timeframe] || [];

  return (
    <main className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <h1><Flame className={styles.headerIcon} /> Trending Skills</h1>
        <p>Discover the fastest-growing capabilities in the SkillSpace ecosystem.</p>
      </div>

      <div className={styles.filterBar}>
        <button className={`${styles.filterBtn} ${timeframe === 'today' ? styles.filterActive : ''}`} onClick={() => setTimeframe('today')}>Today</button>
        <button className={`${styles.filterBtn} ${timeframe === 'week' ? styles.filterActive : ''}`} onClick={() => setTimeframe('week')}>This Week</button>
        <button className={`${styles.filterBtn} ${timeframe === 'month' ? styles.filterActive : ''}`} onClick={() => setTimeframe('month')}>This Month</button>
        <button className={`${styles.filterBtn} ${timeframe === 'allTime' ? styles.filterActive : ''}`} onClick={() => setTimeframe('allTime')}>All Time</button>
      </div>

      <div className={styles.list}>
        {currentList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No trending packages for this timeframe yet.</div>
        ) : (
          currentList.map((item, index) => (
            <Link href={`/packages/${item.name}`} key={item.id} className={styles.card}>
              <div className={styles.rank}>#{index + 1}</div>
              
              <div className={styles.mainInfo}>
                <h2>{item.name}</h2>
                <span className={styles.author}>by @{item.author}</span>
              </div>

              <div className={styles.stats}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Downloads</span>
                  <span className={styles.statValue}><Download size={14} /> {item.downloads.toLocaleString()}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Stars</span>
                  <span className={styles.statValue}><Star size={14} /> {item.stars.toLocaleString()}</span>
                </div>
                <div className={styles.growthBadge}>
                  <ArrowUpRight size={14} /> Trending
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
