export const dynamic = 'force-dynamic';
import styles from './Showcase.module.css';
import { ExternalLink, Rocket } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Showcase — SkillSpace',
  description: 'Projects and startups powered by the SkillSpace Runtime.',
};

export default async function ShowcasePage() {
  const projects = await prisma.showcaseProject.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  const displayProjects = projects.length > 0 ? projects : [
    {
      id: '1',
      name: 'AgenticIDE',
      description: 'A fully autonomous Next.js IDE that uses SkillSpace to run arbitrary code actions within a sandboxed environment.',
      url: 'https://example.com',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      user: { username: 'skillspace-core' }
    },
    {
      id: '2',
      name: 'AutoResearcher',
      description: 'An AI researcher that compiles arXiv papers into readable podcasts using SkillSpace workflows.',
      url: 'https://example.com',
      imageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
      user: { username: 'ai-researcher' }
    },
    {
      id: '3',
      name: 'DataSmith Pro',
      description: 'Enterprise data ETL powered entirely by community contributed data parsers on the SkillSpace registry.',
      url: 'https://example.com',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      user: { username: 'data-smith' }
    }
  ];

  return (
    <main className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <h1><Rocket className={styles.headerIcon} /> Community Showcase</h1>
        <p>Explore incredible applications and agents built on top of the SkillSpace Open Source Execution Runtime.</p>
        
        <button className="btn btnPrimary" style={{ marginTop: '1.5rem' }}>
          Submit Your Project
        </button>
      </div>

      <div className={styles.grid}>
        {displayProjects.map((proj) => (
          <a key={proj.id} href={proj.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
            <div className={styles.imageWrap}>
              {proj.imageUrl ? (
                <img src={proj.imageUrl} alt={proj.name} className={styles.image} />
              ) : (
                <div className={styles.placeholder} />
              )}
            </div>
            <div className={styles.content}>
              <div className={styles.titleRow}>
                <h2>{proj.name}</h2>
                <ExternalLink size={16} className={styles.externalIcon} />
              </div>
              <p className={styles.description}>{proj.description}</p>
              <div className={styles.author}>By @{proj.user?.username}</div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
