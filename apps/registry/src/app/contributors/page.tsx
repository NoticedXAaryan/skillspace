import styles from './Contributors.module.css';
import { Trophy, TrendingUp, Sparkles, Star, Package, Award } from 'lucide-react';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contributors — SkillSpace',
  description: 'Top contributors to the SkillSpace ecosystem.',
};

export default async function ContributorsPage() {
  // In a real scenario, we would aggregate downloads or stars.
  // We'll fetch top users by package count for now.
  const topUsers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      packages: {
        _count: 'desc'
      }
    },
    include: {
      _count: {
        select: { packages: true, followers: true }
      }
    }
  });

  const displayUsers = topUsers.map(u => ({
    username: u.username,
    bio: u.bio,
    packages: u._count.packages,
    followers: u._count.followers
  }));

  return (
    <main className="container">
      <div className={styles.header}>
        <h1><Trophy className={styles.headerIcon} /> Contributor Leaderboard</h1>
        <p>Recognizing the developers building the open AI ecosystem.</p>
      </div>

      <div className={styles.grid}>
        {/* Hall of Fame */}
        <section className={styles.mainSection} style={{ marginBottom: '3rem' }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle} style={{ color: '#f59e0b' }}><Award size={20} /> Hall of Fame</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f59e0b', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff', fontWeight: 'bold' }}>A</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>@alice-ai</h3>
              <p style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '1rem' }}>Contributor of the Month</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recognized for building the core vision processing pipeline.</p>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '2rem', textAlign: 'center' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '2px solid var(--border-subtle)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>B</div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>@bob-builder</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>Community MVP (May 2026)</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resolved over 50 community issues in the LangChain integration.</p>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}><Trophy size={20} /> All-Time Leaderboard</h2>
          </div>
          
          <div className={styles.list}>
            {displayUsers.map((user, index) => (
              <div key={user.username} className={styles.row}>
                <div className={styles.rank}>{index + 1}</div>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatarFallback}>{user.username[0].toUpperCase()}</div>
                </div>
                <div className={styles.userInfo}>
                  <Link href={`/profile/${user.username}`} className={styles.username}>
                    @{user.username}
                  </Link>
                  <p className={styles.bio}>{user.bio || 'Open source contributor'}</p>
                </div>
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <Package size={14} /> {user.packages}
                  </div>
                  <div className={styles.stat}>
                    <Star size={14} /> {user.followers}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.sideBoards}>
          <div className={styles.smallBoard}>
            <div className={styles.boardHeader}>
              <Sparkles size={18} style={{ color: 'var(--success)' }} />
              <h3>Rising Stars</h3>
            </div>
            <div className={styles.listSmall}>
               <div className={styles.rowSmall}>
                 <Link href="/profile/new-dev" className={styles.username}>@new-dev</Link>
                 <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)' }}>+450%</span>
               </div>
               <div className={styles.rowSmall}>
                 <Link href="/profile/creative-ai" className={styles.username}>@creative-ai</Link>
                 <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)' }}>+320%</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
