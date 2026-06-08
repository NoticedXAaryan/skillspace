'use client';

import { useState } from 'react';
import { Star, MessageSquare, BookOpen, Activity } from 'lucide-react';

export default function PackageTabs({ 
  readmeContent, 
  pkgName 
}: { 
  readmeContent: React.ReactNode, 
  pkgName: string 
}) {
  const [activeTab, setActiveTab] = useState<'readme' | 'reviews' | 'discussions' | 'analytics'>('readme');

  return (
    <div className="card" style={{ marginTop: '2rem', padding: '0', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
        <button 
          onClick={() => setActiveTab('readme')}
          style={{
            flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: activeTab === 'readme' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === 'readme' ? 600 : 400, cursor: 'pointer', borderBottom: activeTab === 'readme' ? '2px solid var(--accent)' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <BookOpen size={16} /> Readme
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          style={{
            flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: activeTab === 'reviews' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === 'reviews' ? 600 : 400, cursor: 'pointer', borderBottom: activeTab === 'reviews' ? '2px solid var(--accent)' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Star size={16} /> Reviews
        </button>
        <button 
          onClick={() => setActiveTab('discussions')}
          style={{
            flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: activeTab === 'discussions' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === 'discussions' ? 600 : 400, cursor: 'pointer', borderBottom: activeTab === 'discussions' ? '2px solid var(--accent)' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <MessageSquare size={16} /> Discussions
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: activeTab === 'analytics' ? 600 : 400, cursor: 'pointer', borderBottom: activeTab === 'analytics' ? '2px solid var(--accent)' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Activity size={16} /> Analytics
        </button>
      </div>

      <div style={{ padding: '2.5rem' }}>
        {activeTab === 'readme' && (
          <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            {readmeContent}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Community Reviews</h2>
              <button className="btn btnPrimary">Write a Review</button>
            </div>
            
            <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
              No reviews yet. Be the first to review {pkgName}!
            </div>
          </div>
        )}

        {activeTab === 'discussions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Discussions</h2>
              <button className="btn btnPrimary">New Topic</button>
            </div>
            
            <div style={{ background: 'var(--bg-elevated)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active discussions. Start a thread!
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '2rem' }}>Package Analytics</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Total Executions</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--text-primary)' }}>12.4K</div>
              </div>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Growth Rate</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--success)' }}>+24%</div>
              </div>
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Avg Runtime</div>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--text-primary)' }}>450ms</div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Install Trend (Last 7 Days)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '150px' }}>
                {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.8 }} title={`${h} installs`} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>7 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
