'use client';

import React, { useState } from 'react';
import { Users, Shield, Plus, Settings, Trash2 } from 'lucide-react';

export default function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState('members');

  const orgName = "Acme Corp";
  const members = [
    { id: '1', name: 'Alice Admin', role: 'admin', email: 'alice@acme.com' },
    { id: '2', name: 'Bob Engineer', role: 'member', email: 'bob@acme.com' },
  ];
  
  const allowlist = [
    { id: '1', package: 'sql-optimizer', addedBy: 'Alice Admin', date: '2026-06-05' },
    { id: '2', package: 'react-component-gen', addedBy: 'Alice Admin', date: '2026-06-06' },
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
          {orgName} Organization
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Manage your organization's members, roles, and allowed skills.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        {['members', 'allowlist', 'settings'].map(tab => (
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
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>Organization Members</h3>
              <button className="btn btnPrimary"><Plus size={16} /> Invite Member</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {members.map((person) => (
                <li key={person.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600 }}>{person.name}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{person.email}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="tag">{person.role}</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>Approved Packages</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Skills permitted for execution.</p>
              </div>
              <button className="btn btnPrimary"><Plus size={16} /> Add Package</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {allowlist.map((item) => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
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
                <input type="checkbox" style={{ transform: 'scale(1.5)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 500 }}>Require MFA</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Require all members to enable MFA.</p>
                </div>
                <input type="checkbox" style={{ transform: 'scale(1.5)' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
