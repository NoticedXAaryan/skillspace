'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)', color: 'var(--error)' }}>Something went wrong!</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: '500px' }}>
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <button
          className="btn btnPrimary"
          onClick={() => reset()}
        >
          Try again
        </button>
        <Link href="/" className="btn btnSecondary">
          Go Home
        </Link>
      </div>
    </div>
  );
}
