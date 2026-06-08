export const dynamic = 'force-dynamic';
import styles from './Requests.module.css';
import { Target, Users, Coins } from 'lucide-react';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Skill Requests — SkillSpace',
  description: 'Community requested capabilities and bounties.',
};

export default async function RequestsPage() {
  const requests = await prisma.skillRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const displayRequests = requests.length > 0 ? requests : [
    { id: '1', title: 'Video to Subtitle Parser', description: 'A skill that takes an MP4 video file, extracts audio, transcribes it using Whisper, and outputs an SRT file.', status: 'open', bounty: '$500', user: { username: 'creator-studio' } },
    { id: '2', title: 'Figma to React Component', description: 'Accepts a Figma URL and node ID, and returns a fully styled React/Tailwind component.', status: 'claimed', bounty: '$1,200', user: { username: 'design-corp' } },
    { id: '3', title: 'Local PDF RAG Query', description: 'Injest a PDF into a local ChromaDB instance and query it without internet access.', status: 'completed', bounty: 'None', user: { username: 'privacy-first' } }
  ];

  return (
    <main className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <h1><Target className={styles.headerIcon} /> Skill Requests & Bounties</h1>
        <p>Can&apos;t find what you need? Request a skill. Developers can claim bounties by building requested packages.</p>
        
        <button className="btn btnPrimary" style={{ marginTop: '1.5rem' }}>
          New Request
        </button>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${styles.filterActive}`}>All Requests</button>
        <button className={styles.filterBtn}>Open Bounties</button>
        <button className={styles.filterBtn}>Claimed</button>
        <button className={styles.filterBtn}>Completed</button>
      </div>

      <div className={styles.list}>
        {displayRequests.map((req: any) => (
          <div key={req.id} className={styles.card}>
            <div className={styles.mainCol}>
              <div className={styles.titleRow}>
                <h2>{req.title}</h2>
                <span className={`${styles.badge} ${styles[`badge_${req.status}`]}`}>
                  {req.status === 'open' ? 'Open' : req.status === 'claimed' ? 'In Progress' : 'Completed'}
                </span>
              </div>
              <p className={styles.description}>{req.description}</p>
              <div className={styles.meta}>
                <span className={styles.author}>
                  <Users size={14} /> @{req.user?.username}
                </span>
              </div>
            </div>
            
            <div className={styles.actionCol}>
              <div className={styles.bountyWrap}>
                <span className={styles.bountyLabel}>Bounty</span>
                <span className={styles.bountyAmount}>
                  <Coins size={16} /> {req.bounty || 'Open Source'}
                </span>
              </div>
              <button 
                className={`btn ${req.status === 'open' ? 'btnPrimary' : 'btnSecondary'}`}
                disabled={req.status !== 'open'}
              >
                {req.status === 'open' ? 'Claim Request' : 'View Details'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
