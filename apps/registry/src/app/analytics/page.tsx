import styles from './Analytics.module.css';
import { Activity, TrendingUp, Users, Package, Code } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Open Source Analytics — SkillSpace',
  description: 'Ecosystem metrics and growth charts.',
};

async function getAnalyticsData() {
  const [totalPackages, totalExecutions, totalContributors, topContributors, fastestGrowing] = await Promise.all([
    prisma.package.count(),
    prisma.executionLog.count(),
    prisma.user.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { packages: { _count: 'desc' } },
      include: { _count: { select: { packages: true } } },
    }),
    prisma.package.findMany({
      take: 5,
      orderBy: { downloads: 'desc' },
      select: { name: true, downloads: true }
    })
  ]);

  return { totalPackages, totalExecutions, totalContributors, topContributors, fastestGrowing };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <main className="container" style={{ paddingBottom: '6rem' }}>
      <div className={styles.header}>
        <h1><Activity className={styles.headerIcon} /> Ecosystem Analytics</h1>
        <p>Live metrics from the SkillSpace open source registry and execution runtime.</p>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Packages</div>
          <div className={styles.metricValue}><Package size={24} /> {data.totalPackages.toLocaleString()}</div>
          <div className={styles.metricChange}>Growing community</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Executions</div>
          <div className={styles.metricValue}><Activity size={24} /> {data.totalExecutions.toLocaleString()}</div>
          <div className={styles.metricChange}>SkillSpace runtime</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Contributors</div>
          <div className={styles.metricValue}><Users size={24} /> {data.totalContributors.toLocaleString()}</div>
          <div className={styles.metricChange}>Registered users</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* Chart 1: Executions Over Time */}
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h3>Monthly Executions</h3>
            <TrendingUp size={16} style={{ color: 'var(--success)' }} />
          </div>
          <div className={styles.barChart}>
            {[30, 45, 60, 50, 75, 90].map((h, i) => (
              <div key={i} className={styles.barWrapper}>
                <div className={styles.bar} style={{ height: `${h}%` }}></div>
                <div className={styles.barLabel}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Top Languages / Types */}
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h3>Skill Types</h3>
            <Code size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div className={styles.listChart}>
            <div className={styles.listItem}>
              <span className={styles.listLabel}>Agents</span>
              <div className={styles.listBarWrap}><div className={styles.listBar} style={{ width: '80%', background: '#3b82f6' }}></div></div>
              <span className={styles.listVal}>45%</span>
            </div>
            <div className={styles.listItem}>
              <span className={styles.listLabel}>Workflows</span>
              <div className={styles.listBarWrap}><div className={styles.listBar} style={{ width: '60%', background: '#10b981' }}></div></div>
              <span className={styles.listVal}>30%</span>
            </div>
            <div className={styles.listItem}>
              <span className={styles.listLabel}>Tools</span>
              <div className={styles.listBarWrap}><div className={styles.listBar} style={{ width: '35%', background: '#f59e0b' }}></div></div>
              <span className={styles.listVal}>15%</span>
            </div>
            <div className={styles.listItem}>
              <span className={styles.listLabel}>Models</span>
              <div className={styles.listBarWrap}><div className={styles.listBar} style={{ width: '25%', background: '#8b5cf6' }}></div></div>
              <span className={styles.listVal}>10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tablesGrid}>
        <div className={styles.tableCard}>
          <h3>Top Contributors</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Developer</th>
                <th>Packages Published</th>
              </tr>
            </thead>
            <tbody>
              {data.topContributors.map(user => (
                <tr key={user.id}>
                  <td><Link href={`/profile/${user.username}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>@{user.username}</Link></td>
                  <td>{user._count.packages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tableCard}>
          <h3>Most Downloaded Skills</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Package</th>
                <th>Downloads</th>
              </tr>
            </thead>
            <tbody>
              {data.fastestGrowing.map(pkg => (
                <tr key={pkg.name}>
                  <td><Link href={`/packages/${pkg.name}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{pkg.name}</Link></td>
                  <td style={{ color: 'var(--success)' }}>{pkg.downloads.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
