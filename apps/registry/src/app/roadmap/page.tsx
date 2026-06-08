export const dynamic = 'force-dynamic';
import styles from './Roadmap.module.css';
import { Map, CheckCircle2, CircleDashed, ArrowRightCircle, ThumbsUp } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Roadmap — SkillSpace',
  description: 'Public feature roadmap and voting.',
};

export default async function RoadmapPage() {
  const items = await prisma.roadmapItem.findMany({
    include: {
      _count: { select: { votes: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const displayItems = items.length > 0 ? items : [
    { id: '1', title: 'Support for Gemini 2.0 Pro', description: 'Update the core runtime to natively support the newest Gemini models with full multimodal streaming.', status: 'in_progress', _count: { votes: 142 } },
    { id: '2', title: 'Python SDK', description: 'Create a pip-installable python SDK to interact with the SkillSpace engine from backend microservices.', status: 'planned', _count: { votes: 89 } },
    { id: '3', title: 'Organization Workspaces', description: 'Allow teams to group their private packages and manage access control lists.', status: 'planned', _count: { votes: 65 } },
    { id: '4', title: 'Agent Sandbox 2.0', description: 'Secure gVisor integration for the background execution of arbitrary untrusted packages.', status: 'completed', _count: { votes: 215 } }
  ];

  const planned = displayItems.filter(i => i.status === 'planned');
  const inProgress = displayItems.filter(i => i.status === 'in_progress');
  const completed = displayItems.filter(i => i.status === 'completed');

  const Column = ({ title, icon: Icon, items, color }: { title: string, icon: any, items: any[], color: string }) => (
    <div className={styles.column}>
      <div className={styles.colHeader} style={{ borderBottomColor: color }}>
        <Icon size={18} style={{ color }} />
        <h2>{title} ({items.length})</h2>
      </div>
      
      <div className={styles.itemList}>
        {items.map(item => (
          <div key={item.id} className={styles.card}>
            <div className={styles.voteBox}>
              <button className={styles.voteBtn}>
                <ThumbsUp size={14} />
              </button>
              <span className={styles.voteCount}>{item._count.votes}</span>
            </div>
            
            <div className={styles.cardContent}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <h1><Map className={styles.headerIcon} /> Public Roadmap</h1>
        <p>Help shape the future of SkillSpace. Vote on features or submit new ideas.</p>
        
        <button className="btn btnPrimary" style={{ marginTop: '1.5rem' }}>
          Submit Feature Request
        </button>
      </div>

      <div className={styles.board}>
        <Column title="Planned" icon={CircleDashed} items={planned} color="var(--text-muted)" />
        <Column title="In Progress" icon={ArrowRightCircle} items={inProgress} color="var(--accent)" />
        <Column title="Completed" icon={CheckCircle2} items={completed} color="var(--success)" />
      </div>
    </main>
  );
}
