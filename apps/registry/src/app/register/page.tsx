'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'transparent', width: '0%' };
    if (pwd.length < 8) return { label: 'Weak', color: '#ef4444', width: '33%' };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return { label: 'Strong', color: '#22c55e', width: '100%' };
    return { label: 'Medium', color: '#f59e0b', width: '66%' };
  };
  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error.message);
      } else {
        localStorage.setItem('token', data.data.token);
        router.push('/');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">Start publishing and installing AI capabilities</p>

        {error && <div className="mb-6 rounded-md bg-destructive/15 p-3 text-center text-sm font-medium text-destructive">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none text-foreground">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              minLength={3}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-none text-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
            {password && (
              <div className="mt-2">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Password strength:</span>
                  <span style={{ color: strength.color, fontWeight: 'bold' }}>{strength.label}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full transition-all duration-300 ease-in-out" style={{ width: strength.width, backgroundColor: strength.color }} />
                </div>
              </div>
            )}
          </div>
          <div className="mb-4 text-sm leading-relaxed text-muted-foreground">
            By creating an account, you agree to our <Link href="/terms" className="text-foreground hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-foreground hover:underline">Privacy Policy</Link>.
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
