'use client';

import { useState, useMemo } from 'react';
import PackageCard from '@/components/PackageCard';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <main className="container mx-auto px-4 py-8 min-h-[80vh] flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Filters */}
      <aside className="w-full md:w-[280px] shrink-0">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:sticky md:top-24">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Filter size={16} /> Filters
          </h3>
          
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">Category / Type</label>
            <select 
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
              value={type} 
              onChange={e => setType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Agent">Agent</option>
              <option value="Workflow">Workflow</option>
              <option value="Tool">Tool</option>
              <option value="Model">Model</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Minimum Stars: {minStars > 0 ? `${minStars}+` : 'Any'}
            </label>
            <input 
              type="range" 
              min="0" 
              max="500" 
              step="50" 
              value={minStars} 
              onChange={e => setMinStars(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="mb-6 flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
              <input 
                type="checkbox" 
                checked={openSourceOnly} 
                onChange={e => setOpenSourceOnly(e.target.checked)} 
                className="h-4 w-4 accent-primary"
              />
              Open Source Only
            </label>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
              <input 
                type="checkbox" 
                checked={verifiedOnly} 
                onChange={e => setVerifiedOnly(e.target.checked)} 
                className="h-4 w-4 accent-primary"
              />
              Verified Publisher Only
            </label>
          </div>
        </div>
      </aside>

      {/* Main Results */}
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-center rounded-xl border border-border bg-card px-4 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
          <SearchIcon className="text-muted-foreground" size={20} />
          <input 
            type="text" 
            placeholder="Search packages by name or description..." 
            className="w-full bg-transparent p-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className="mb-4 border-b border-border pb-4 text-sm text-muted-foreground">
          <span>Found {filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card py-12 text-center shadow-sm">
            <h3 className="mb-2 text-xl font-bold text-foreground">No results found</h3>
            <p className="mb-6 text-muted-foreground">Try adjusting your filters or search query.</p>
            <Button variant="secondary" onClick={() => {
              setQuery(''); setType('all'); setMinStars(0); setOpenSourceOnly(false); setVerifiedOnly(false);
            }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((pkg: any, i: number) => (
              <PackageCard key={pkg.name} pkg={pkg} index={i} />
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
