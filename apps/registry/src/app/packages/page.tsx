'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, PackageSearch } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import EmptyState from '@/components/EmptyState';
import styles from './page.module.css';

interface PackageData {
  name: string;
  description: string;
  downloads: number;
  latestVersion?: string;
  tags: string[];
  owner?: { username: string };
  type?: string;
}

function PackagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(q);
  const [debouncedQuery, setDebouncedQuery] = useState(q);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 12;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query !== q) {
        const params = new URLSearchParams(searchParams.toString());
        if (query) params.set('q', query);
        else params.delete('q');
        params.set('page', '1');
        router.push(`/packages?${params.toString()}`);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, q, router, searchParams]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const offset = (pageParam - 1) * limit;
        let url = `/api/packages?limit=${limit}&offset=${offset}`;
        if (debouncedQuery) url += `&search=${encodeURIComponent(debouncedQuery)}`;
        if (typeParam !== 'all') url += `&type=${typeParam}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPackages(data.data || []);
          setTotal(data.pagination?.total || 0);
        } else {
          setPackages([]);
          setTotal(0);
        }
      } catch (err) {
        console.error('Failed to fetch packages', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [debouncedQuery, typeParam, pageParam]);

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newType !== 'all') params.set('type', newType);
    else params.delete('type');
    params.set('page', '1');
    router.push(`/packages?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/packages?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Registry</h1>
        <p className={styles.subtitle}>Discover AI skills, agents, and workflows.</p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={`input ${styles.searchInput}`}
            placeholder="Search capabilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Type:</span>
            {['all', 'skill', 'agent', 'workflow'].map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`${styles.filterPill} ${typeParam === t ? styles.filterPillActive : ''}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Sort:</span>
            <button className={`${styles.filterPill} ${styles.filterPillActive}`}>Popular</button>
            <button className={styles.filterPill}>Recent</button>
            <button className={styles.filterPill}>Name A–Z</button>
          </div>
        </div>
      </div>

      <div className={styles.resultsHeader}>
        <div className={styles.resultsCount}>
          {loading ? 'Searching...' : `${total} capabilities found`}
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState
          icon={<PackageSearch size={32} style={{ color: 'var(--text-muted)' }} />}
          title="No capabilities found"
          description="We couldn't find any packages matching your search criteria."
          actionText="Clear filters"
          onAction={() => { setQuery(''); handleTypeChange('all'); }}
        />
      ) : (
        <div className={styles.grid}>
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.name} pkg={pkg} index={i} />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className="btn btnSecondary"
            disabled={pageParam <= 1}
            onClick={() => handlePageChange(pageParam - 1)}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {pageParam} of {totalPages}
          </span>
          <button
            className="btn btnSecondary"
            disabled={pageParam >= totalPages}
            onClick={() => handlePageChange(pageParam + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <main className={styles.main}>
      <Suspense fallback={<div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
        <PackagesContent />
      </Suspense>
    </main>
  );
}
