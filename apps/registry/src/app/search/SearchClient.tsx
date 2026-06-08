'use client';

import { useState, useMemo } from 'react';
import PackageCard from '@/components/PackageCard';
import { Search as SearchIcon, Filter } from 'lucide-react';
import styles from './Search.module.css';

export default function SearchClient({ initialData, initialQuery }: { initialData: any[], initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [type, setType] = useState('all');
  const [minStars, setMinStars] = useState(0);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = useMemo(() => {
    return initialData.filter(pkg => {
      // Name search
      if (query && !pkg.name.toLowerCase().includes(query.toLowerCase()) && !(pkg.description || '').toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      
      // Type
      if (type !== 'all' && pkg.type !== type) return false;
      
      // Min Stars (mocking relation count for this demo)
      const stars = pkg._count?.stars || 0;
      if (stars < minStars) return false;
      
      // Flags
      if (openSourceOnly && pkg.isPrivate) return false;
      if (verifiedOnly && !pkg.verified) return false;

      return true;
    });
  }, [initialData, query, type, minStars, openSourceOnly, verifiedOnly]);

  return (
    <main className="container" style={{ padding: '2rem 0', minHeight: '80vh', display: 'flex', gap: '2rem' }}>
      
      {/* Sidebar Filters */}
      <aside className={styles.sidebar}>
        <div className={styles.filterSection}>
          <h3 className={styles.filterTitle}><Filter size={16} /> Filters</h3>
          
          <div className={styles.filterGroup}>
            <label className={styles.label}>Category / Type</label>
            <select className={styles.select} value={type} onChange={e => setType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Agent">Agent</option>
              <option value="Workflow">Workflow</option>
              <option value="Tool">Tool</option>
              <option value="Model">Model</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Minimum Stars: {minStars > 0 ? `${minStars}+` : 'Any'}</label>
            <input 
              type="range" 
              min="0" 
              max="500" 
              step="50" 
              value={minStars} 
              onChange={e => setMinStars(Number(e.target.value))}
              className={styles.range}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={openSourceOnly} onChange={e => setOpenSourceOnly(e.target.checked)} />
              Open Source Only
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} />
              Verified Publisher Only
            </label>
          </div>
        </div>
      </aside>

      {/* Main Results */}
      <div className={styles.main}>
        <div className={styles.searchBar}>
          <SearchIcon className={styles.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search packages by name or description..." 
            className={styles.searchInput}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.resultsHeader}>
          <span>Found {filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No results found</h3>
            <p>Try adjusting your filters or search query.</p>
            <button className="btn btnSecondary" onClick={() => {
              setQuery(''); setType('all'); setMinStars(0); setOpenSourceOnly(false); setVerifiedOnly(false);
            }}>Clear all filters</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((pkg: any, i: number) => (
              <PackageCard key={pkg.name} pkg={pkg} index={i} />
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
