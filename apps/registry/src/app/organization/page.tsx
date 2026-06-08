'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Settings, Trash2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PackageCard from '@/components/PackageCard';

export default function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState('packages');
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchOrgs() {
      try {
        const res = await fetch('/api/orgs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.orgs) {
          setOrgs(data.orgs);
          if (data.orgs.length > 0) {
            setSelectedOrgId(data.orgs[0].id);
          }
        } else if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to fetch orgs', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrgs();
  }, [router]);

  if (loading) return <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>Loading organizations...</main>;

  if (orgs.length === 0) {
    return (
      <main className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>No Organizations Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You are not a member of any organizations yet.</p>
        <button className="btn btnPrimary" style={{ marginTop: '2rem' }}>Create Organization</button>
      </main>
    );
  }

  const selectedOrg = orgs.find(o => o.id === selectedOrgId) || orgs[0];
  
  const allowlist = [
    { id: '1', package: 'sql-optimizer', addedBy: 'Alice Admin', date: '2026-06-05' },
    { id: '2', package: 'react-component-gen', addedBy: 'Alice Admin', date: '2026-06-06' },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '80vh' }}>
      {orgs.length > 1 && (
        <div style={{ marginBottom: '2rem' }}>
          <select 
            className="input" 
            style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-base)', width: 'auto', display: 'inline-block' }}
            value={selectedOrgId} 
            onChange={(e) => setSelectedOrgId(e.target.value)}
          >
            {orgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
          </select>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--gradient-start)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            {selectedOrg.name.charAt(0).toUpperCase()}
          </div>
          {selectedOrg.name}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="tag">@{selectedOrg.slug}</span>
          Manage your organization's members, packages, and allowed skills.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
        {['packages', 'members', 'allowlist', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card" style={{ minHeight: '400px' }}>
        {activeTab === 'packages' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>Packages</h3>
              <Link href="/docs/publishing" className="btn btnPrimary"><Plus size={16} /> Publish Package</Link>
            </div>
            {selectedOrg.packages && selectedOrg.packages.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {selectedOrg.packages.map((pkg: any, i: number) => {
                  const enrichedPkg = {
                    ...pkg,
                    tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags,
                    latestVersion: pkg.versions?.[0]?.version,
                    owner: { username: selectedOrg.slug }
                  };
                  return <PackageCard key={pkg.id} pkg={enrichedPkg} index={i} />;
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Package size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No packages published by this organization yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>Organization Members</h3>
              <button className="btn btnPrimary"><Plus size={16} /> Invite Member</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {selectedOrg.members?.map((member: any) => (
                <li key={member.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {member.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600 }}>{member.user?.username}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{member.user?.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="tag">{member.role}</span>
                    <button style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'allowlist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>Approved Packages</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Skills permitted for execution.</p>
              </div>
              <button className="btn btnPrimary"><Plus size={16} /> Add Package</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {allowlist.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Shield size={20} color="var(--success)" />
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600 }}>{item.package}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Added by {item.addedBy} on {item.date}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Organization Policies</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 500 }}>Enforce Strict Allowlist</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Members can ONLY execute packages in the allowlist.</p>
                </div>
                <input type="checkbox" style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 500 }}>Require MFA</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Require all members to enable MFA.</p>
                </div>
                <input type="checkbox" style={{ transform: 'scale(1.5)', cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
