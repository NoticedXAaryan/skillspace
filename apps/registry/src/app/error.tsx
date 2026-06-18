'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center bg-black text-white">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
      <p className="text-neutral-400 max-w-md">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-8"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
