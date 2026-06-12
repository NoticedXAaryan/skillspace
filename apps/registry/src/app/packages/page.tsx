'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, PackageSearch } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  const sortParam = searchParams.get('sort') || 'popular';
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
        let url = `/api/packages?limit=${limit}&page=${pageParam}&sort=${sortParam}`;
        if (debouncedQuery) url += `&search=${encodeURIComponent(debouncedQuery)}`;
        if (typeParam !== 'all') url += `&type=${typeParam}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setPackages(data.data || []);
          setTotal(data.meta?.total || 0);
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
  }, [debouncedQuery, typeParam, sortParam, pageParam]);

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newType !== 'all') params.set('type', newType);
    else params.delete('type');
    params.set('page', '1');
    router.push(`/packages?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort !== 'popular') params.set('sort', newSort);
    else params.delete('sort');
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">Browse Registry</h1>
        <p className="text-lg text-muted-foreground">Discover AI skills, agents, and workflows.</p>
      </div>

      <div className="mx-auto mb-8 flex max-w-3xl flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            className="w-full rounded-xl border border-input bg-background py-3 pl-12 pr-4 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Search capabilities..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-medium text-muted-foreground">Type:</span>
            {['all', 'skill', 'agent', 'workflow'].map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  typeParam === t 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-medium text-muted-foreground">Sort:</span>
            {['popular', 'recent', 'name'].map(s => (
              <button
                key={s}
                onClick={() => handleSortChange(s)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  sortParam === s 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                {s === 'name' ? 'Name A-Z' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between border-b pb-2">
        <div className="text-sm text-muted-foreground">
          {loading ? 'Searching...' : `${total} capabilities found`}
        </div>
      </div>

      {loading ? (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[180px] animate-pulse rounded-md border bg-muted" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        query || typeParam !== 'all' ? (
          <EmptyState
            icon={<PackageSearch size={32} className="text-muted-foreground" />}
            title="No packages match your search"
            description="We couldn't find any capabilities matching your current filters and query."
            actionText="Clear all filters"
            onAction={() => { 
              setQuery(''); 
              const params = new URLSearchParams(searchParams.toString());
              params.delete('q');
              params.delete('type');
              params.delete('sort');
              params.set('page', '1');
              router.push(`/packages?${params.toString()}`);
            }}
          />
        ) : (
          <EmptyState
            icon={<PackageSearch size={32} className="text-muted-foreground" />}
            title="The registry is empty"
            description="Be the first to publish an AI skill, agent, or workflow to the ecosystem."
            actionText="Learn to publish"
            actionHref="/create"
          />
        )
      ) : (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.name} pkg={pkg} index={i} />
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={pageParam <= 1}
            onClick={() => handlePageChange(pageParam - 1)}
          >
            Previous
          </Button>
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            Page {pageParam} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={pageParam >= totalPages}
            onClick={() => handlePageChange(pageParam + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div className="container mx-auto flex min-h-[60vh] items-center justify-center">Loading...</div>}>
        <PackagesContent />
      </Suspense>
    </main>
  );
}
