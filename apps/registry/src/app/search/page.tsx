import PackageCard from '@/components/PackageCard';
import { PackageSearch } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} — SkillSpace` : 'Search — SkillSpace',
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;

  let packages = [];
  let total = 0;

  if (q) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(q)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        packages = data.data || [];
        total = data.pagination?.total || packages.length;
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Search Results</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {q ? `Showing results for "${q}"` : 'Enter a search query to find capabilities'}
        </p>
      </div>

      {!q ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <PackageSearch size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>No search query provided</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please use the search bar above to find what you're looking for.</p>
          <Link href="/packages" className="btn btnPrimary">Browse Registry</Link>
        </div>
      ) : packages.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <PackageSearch size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>No results found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We couldn&apos;t find anything matching &quot;{q}&quot;.</p>
          <Link href="/packages" className="btn btnSecondary">Browse All Packages</Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Found {total} package{total === 1 ? '' : 's'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {packages.map((pkg: any, i: number) => (
              <PackageCard key={pkg.name} pkg={pkg} index={i} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
