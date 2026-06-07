'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (!res.ok || data.error) {
          setError(data.error?.message || 'Failed to load profile');
          if (res.status === 401) {
            localStorage.removeItem('token');
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
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  if (loading) {
    return <main className={styles.loading}>Loading profile...</main>;
  }

  if (error) {
    return (
      <main className={styles.profilePage}>
        <div className={styles.error}>{error}</div>
        <div style={{ textAlign: 'center' }}>
          <button onClick={handleLogout} className="btn btnSecondary">
            Sign out and try again
          </button>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className={`${styles.profilePage} fadeInUp`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, {profile.username}</h1>
        <p className={styles.subtitle}>Manage your packages and account settings</p>
      </div>

      <div className={styles.grid}>
        <aside className={styles.sidebar}>
          <div className="card">
            <h2 className={styles.sectionTitle}>Account Info</h2>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Username</span>
              <span className={styles.infoValue}>@{profile.username}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{profile.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Plan</span>
              <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>
                {profile.plan}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>
                {profile.verified ? (
                  <span className="tag" style={{ color: 'var(--success)' }}>Verified</span>
                ) : (
                  <span className="tag" style={{ color: 'var(--warning)' }}>Unverified</span>
                )}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Joined</span>
              <span className={styles.infoValue}>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="btn btnSecondary" 
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
            >
              Sign Out
            </button>
          </div>
        </aside>

        <div className={styles.mainContent}>
          <div className="card">
            <h2 className={styles.sectionTitle}>Your Packages</h2>
            {profile.packages.length > 0 ? (
              <div className={styles.packageList}>
                {profile.packages.map((pkg) => (
                  <Link href={`/packages/${pkg.name}`} key={pkg.id} className={styles.packageCard}>
                    <div className={styles.packageName}>{pkg.name}</div>
                    <div className={styles.packageDesc}>{pkg.description}</div>
                    <div className={styles.packageMeta}>
                      <span>Downloads: {pkg.downloads.toLocaleString()}</span>
                      <span>
                        Latest: {pkg.versions[0]?.version || 'No versions'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>You haven&apos;t published any packages yet.</p>
            )}
          </div>

          <div className="card">
            <h2 className={styles.sectionTitle}>Organizations</h2>
            {profile.orgMemberships.length > 0 ? (
              <div className={styles.orgList}>
                {profile.orgMemberships.map((membership) => (
                  <div key={membership.id} className={styles.orgCard}>
                    <div>
                      <div className={styles.orgName}>{membership.organization.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        @{membership.organization.slug} • {membership.organization.plan} plan
                      </div>
                    </div>
                    <div className={styles.orgRole}>{membership.role}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>You are not a member of any organizations.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
