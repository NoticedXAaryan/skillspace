import styles from './Hackathons.module.css';
import { Trophy, Calendar, Users, Target, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Hackathons & Challenges — SkillSpace',
  description: 'Participate in community challenges and monthly skill competitions.',
};

export default function HackathonsPage() {
  return (
    <main className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <h1><Trophy className={styles.headerIcon} /> Hackathons & Challenges</h1>
        <p>Build the future of open source AI. Compete in monthly challenges, earn bounties, and climb the global leaderboard.</p>
      </div>

      <div className={styles.grid}>
        {/* Active Challenge */}
        <section className={styles.activeSection}>
          <div className={styles.sectionHeader}>
            <h2>Active Monthly Challenge</h2>
            <span className={styles.liveBadge}><span className={styles.pulse}></span> Live Now</span>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.heroContent}>
              <div className={styles.tag}>June 2026</div>
              <h3>The Autonomous Agents Hackathon</h3>
              <p>Build a fully autonomous agent using the SkillSpace Runtime that can accomplish a complex multi-step workflow without human intervention.</p>
              
              <div className={styles.meta}>
                <span className={styles.metaItem}><Trophy size={16} /> $5,000 Prize Pool</span>
                <span className={styles.metaItem}><Calendar size={16} /> Ends in 12 Days</span>
                <span className={styles.metaItem}><Users size={16} /> 432 Participants</span>
              </div>

              <div className={styles.actions}>
                <button className="btn btnPrimary">Join Challenge</button>
                <button className="btn btnSecondary">View Rules</button>
              </div>
            </div>
            <div className={styles.heroImage}>
               {/* Decorative placeholder */}
               <div className={styles.decoCube}></div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3><Target size={18} /> Global Leaderboard</h3>
            <p className={styles.sideDesc}>Top builders this season</p>
            
            <div className={styles.leaderboard}>
              {[
                { name: 'alice-ai', score: 2450 },
                { name: 'bob-builder', score: 2100 },
                { name: 'charlie-dev', score: 1850 },
                { name: 'data-wizard', score: 1600 },
                { name: 'eve-hacker', score: 1420 },
              ].map((user, i) => (
                <div key={user.name} className={styles.lbRow}>
                  <div className={styles.lbRank}>#{i + 1}</div>
                  <div className={styles.lbName}>@{user.name}</div>
                  <div className={styles.lbScore}>{user.score} pts</div>
                </div>
              ))}
            </div>
            
            <button className={styles.viewAllBtn}>View Full Rankings <ArrowRight size={14} /></button>
          </div>

          <div className={styles.sideCard}>
            <h3>Upcoming Events</h3>
            <ul className={styles.eventList}>
              <li>
                <div className={styles.eventDate}>July 1-15</div>
                <div className={styles.eventName}>Vision Models Challenge</div>
              </li>
              <li>
                <div className={styles.eventDate}>August 10-12</div>
                <div className={styles.eventName}>SkillSpace 48h Global Hack</div>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Past Winners */}
      <section className={styles.pastSection}>
        <h2>Past Winners</h2>
        <div className={styles.pastGrid}>
          {[
            { month: 'May 2026', title: 'Data Pipeline Masters', winner: 'data-smith', prize: '$3,000' },
            { month: 'April 2026', title: 'Generative UI Challenge', winner: 'design-corp', prize: '$2,500' },
            { month: 'March 2026', title: 'Local Models Hack', winner: 'privacy-first', prize: '$4,000' },
          ].map(past => (
            <div key={past.month} className={styles.pastCard}>
              <div className={styles.pastMonth}>{past.month}</div>
              <h3>{past.title}</h3>
              <div className={styles.pastWinner}>Winner: <strong>@{past.winner}</strong></div>
              <div className={styles.pastPrize}>Prize: {past.prize}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
