import Link from 'next/link';
import { PackageX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <PackageX size={64} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }} />
      <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>Package Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '400px' }}>
        The capability or page you are looking for does not exist in the registry or may have been removed.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <Link href="/packages" className="btn btnPrimary">
          Browse Registry
        </Link>
        <Link href="/" className="btn btnSecondary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
