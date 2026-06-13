'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PackageCard from '@/components/PackageCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  plan: string;
  verified: boolean;
  createdAt: string;
  packages: Array<{
    id: string;
    name: string;
    description: string;
    downloads: number;
    versions: Array<{ version: string }>;
  }>;
  orgMemberships: Array<{
    id: string;
    role: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      plan: string;
    };
  }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.push('/login');
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        
        if (!res.ok || data.error) {
          setError(data.error?.message || 'Failed to load profile');
          if (res.status === 401) {
            router.push('/login');
          }
        } else {
          setProfile(data.data);
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session, isPending, router]);

  async function handleLogout() {
    await authClient.signOut();
    router.push('/');
  }

  if (loading) {
    return <main className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Loading profile...</main>;
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="mb-6 rounded-md bg-destructive/15 p-4 text-center font-medium text-destructive">{error}</div>
        <div className="text-center">
          <Button variant="secondary" onClick={handleLogout}>
            Sign out and try again
          </Button>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="mb-10 text-center md:text-left">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Welcome back, {profile.username}</h1>
        <p className="text-lg text-muted-foreground">Manage your packages and account settings</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr]">
        <aside className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 border-b border-border pb-2 text-xl font-bold text-foreground">Account Info</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Username</span>
                <span className="font-medium text-foreground">@{profile.username}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Email</span>
                <span className="font-medium text-foreground">{profile.email}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Plan</span>
                <span className="font-medium capitalize text-foreground">{profile.plan}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Status</span>
                <span>
                  {profile.verified ? (
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 border">Verified</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-amber-500 border-amber-500/20">Unverified</Badge>
                  )}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Joined</span>
                <span className="font-medium text-foreground">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              onClick={handleLogout} 
              className="mt-8 w-full"
            >
              Sign Out
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 border-b border-border pb-2 text-xl font-bold text-foreground">Security</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Two-Factor Auth</span>
                <p className="text-sm text-muted-foreground mb-2">Protect your account with an extra layer of security.</p>
                <Button variant="outline" className="w-full" onClick={() => router.push('/profile/2fa')}>
                  Configure 2FA
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 border-b border-border pb-2 text-xl font-bold text-foreground">Your Packages</h2>
            {profile.packages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {profile.packages.map((pkg: any, i: number) => {
                  const enrichedPkg = {
                    ...pkg,
                    tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags,
                    latestVersion: pkg.versions?.[0]?.version,
                    owner: { username: profile.username }
                  };
                  return <PackageCard key={pkg.id} pkg={enrichedPkg} index={i} />;
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">You haven&apos;t published any packages yet.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 border-b border-border pb-2 text-xl font-bold text-foreground">Organizations</h2>
            {profile.orgMemberships.length > 0 ? (
              <div className="flex flex-col gap-3">
                {profile.orgMemberships.map((membership) => (
                  <div key={membership.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50">
                    <div>
                      <div className="font-semibold text-foreground">{membership.organization.name}</div>
                      <div className="text-xs text-muted-foreground">
                        @{membership.organization.slug} • <span className="capitalize">{membership.organization.plan}</span> plan
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{membership.role}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">You are not a member of any organizations.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
