'use client';

import { useState } from 'react';
import styles from './Profile.module.css';
import { Globe, MapPin, Package, Star, Users, Folder, Code2, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  username: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  github: string | null;
  website: string | null;
  twitter: string | null;
  createdAt: Date;
  stats: {
    followers: number;
    following: number;
    packages: number;
  };
  packages: any[];
}

export default function ProfileClient({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<'skills' | 'collections' | 'followers' | 'achievements'>('skills');

  return (
    <div className={styles.container}>
      <div 
        className={styles.banner} 
        style={profile.banner ? { backgroundImage: `url(${profile.banner})` } : {}}
      >
        <div className={styles.avatarWrapper}>
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>{profile.username[0].toUpperCase()}</div>
          )}
        </div>
      </div>

      <div className={styles.headerContent}>
        <div className={styles.userInfo}>
          <h1>@{profile.username}</h1>
          <p>{profile.bio || 'This user has no bio yet.'}</p>
          
          <div className={styles.socials}>
            {profile.github && (
              <a href={profile.github} target="_blank" className={styles.socialLink}>
                <Code2 size={16} /> GitHub
              </a>
            )}
            {profile.twitter && (
              <a href={profile.twitter} target="_blank" className={styles.socialLink}>
                <MessageCircle size={16} /> Twitter
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" className={styles.socialLink}>
                <Globe size={16} /> Website
              </a>
            )}
          </div>
        </div>

        <button className="btn btnPrimary">Follow</button>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'skills' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <Package size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Skills ({profile.stats.packages})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'collections' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          <Folder size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Collections
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'followers' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Followers ({profile.stats.followers})
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'achievements' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Star size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Achievements
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'skills' && (
          <div className={styles.grid}>
            {profile.packages.length > 0 ? (
              profile.packages.map(pkg => (
                <Link href={`/packages/${pkg.name}`} key={pkg.id} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', height: '100%' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>{pkg.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>{pkg.description}</p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={12}/> {pkg._count?.stars || 0}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.emptyState}>No skills published yet.</div>
            )}
          </div>
        )}

        {activeTab === 'collections' && (
          <div className={styles.emptyState}>No collections created yet.</div>
        )}

        {activeTab === 'followers' && (
          <div className={styles.emptyState}>No followers yet.</div>
        )}
      </div>
    </div>
  );
}
