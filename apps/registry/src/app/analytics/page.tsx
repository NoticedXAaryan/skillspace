import { Activity, TrendingUp, Users, Package, Code } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ExecutionBarChart, TypePieChart } from './AnalyticsCharts';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Open Source Analytics — SkillSpace',
  description: 'Ecosystem metrics and growth charts.',
};

async function getAnalyticsData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totalPackages, totalExecutions, totalContributors, topContributors, fastestGrowing, executionByMonth, packageTypes] = await Promise.all([
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
    }),
    prisma.$queryRawUnsafe<{ month: string; value: bigint }[]>(`
      SELECT to_char("createdAt", 'YYYY-MM') as month, count(*) as value
      FROM "ExecutionLog"
      WHERE "createdAt" >= $1
      GROUP BY to_char("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `, sixMonthsAgo),
    prisma.$queryRawUnsafe<{ type: string; value: bigint }[]>(`
      SELECT type, count(*) as value
      FROM "Package"
      GROUP BY type
      ORDER BY value DESC
    `),
  ]);

  const monthlyData = executionByMonth.map(row => ({
    name: row.month.slice(5),
    value: Number(row.value),
  }));

  const typeColors: Record<string, string> = {
    skill: '#3b82f6',
    agent: '#10b981',
    workflow: '#f59e0b',
    mcp: '#8b5cf6',
    knowledge: '#ec4899',
  };

  const typeData = packageTypes.map(row => ({
    name: row.type.charAt(0).toUpperCase() + row.type.slice(1),
    value: Number(row.value),
    color: typeColors[row.type] || '#6b7280',
  }));

  return { totalPackages, totalExecutions, totalContributors, topContributors, fastestGrowing, monthlyData, typeData };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <main className="container mx-auto px-4 pb-24 pt-8">
      <div className="mb-12 pt-8 text-center">
        <h1 className="mb-4 flex items-center justify-center gap-3 text-4xl font-bold tracking-tight text-foreground">
          <Activity className="h-8 w-8 text-green-500" /> Ecosystem Analytics
        </h1>
        <p className="mx-auto max-w-[600px] text-xl text-muted-foreground">Live metrics from the SkillSpace open source registry and execution runtime.</p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Packages</div>
          <div className="mb-2 flex items-center gap-3 text-4xl font-bold text-foreground"><Package size={24} /> {data.totalPackages.toLocaleString()}</div>
          <div className="text-sm font-bold text-green-500">Growing community</div>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Executions</div>
          <div className="mb-2 flex items-center gap-3 text-4xl font-bold text-foreground"><Activity size={24} /> {data.totalExecutions.toLocaleString()}</div>
          <div className="text-sm font-bold text-green-500">SkillSpace runtime</div>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Contributors</div>
          <div className="mb-2 flex items-center gap-3 text-4xl font-bold text-foreground"><Users size={24} /> {data.totalContributors.toLocaleString()}</div>
          <div className="text-sm font-bold text-green-500">Registered users</div>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 1: Executions Over Time */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-lg font-semibold text-foreground">Monthly Executions</h3>
            <TrendingUp size={16} className="text-green-500" />
          </div>
          <ExecutionBarChart data={data.monthlyData} />
        </div>

        {/* Chart 2: Top Languages / Types */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-lg font-semibold text-foreground">Skill Types</h3>
            <Code size={16} className="text-amber-500" />
          </div>
          <TypePieChart data={data.typeData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 border-b border-border pb-3 text-lg font-semibold text-foreground">Top Contributors</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border p-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">Developer</th>
                  <th className="border-b border-border p-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">Packages Published</th>
                </tr>
              </thead>
              <tbody>
                {data.topContributors.length === 0 ? (
                  <tr><td colSpan={2} className="p-6 text-center text-sm text-muted-foreground">No contributors yet.</td></tr>
                ) : data.topContributors.map(user => (
                  <tr key={user.id} className="last:border-0 border-b border-border">
                    <td className="p-3 text-sm text-foreground"><Link href={`/profile/${user.username}`} className="hover:underline">@{user.username}</Link></td>
                    <td className="p-3 text-sm text-foreground">{user._count.packages}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 border-b border-border pb-3 text-lg font-semibold text-foreground">Most Downloaded Skills</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border p-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">Package</th>
                  <th className="border-b border-border p-3 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">Downloads</th>
                </tr>
              </thead>
              <tbody>
                {data.fastestGrowing.length === 0 ? (
                  <tr><td colSpan={2} className="p-6 text-center text-sm text-muted-foreground">No packages published yet.</td></tr>
                ) : data.fastestGrowing.map(pkg => (
                  <tr key={pkg.name} className="last:border-0 border-b border-border">
                    <td className="p-3 text-sm text-foreground"><Link href={`/packages/${pkg.name}`} className="hover:underline">{pkg.name}</Link></td>
                    <td className="p-3 text-sm font-medium text-green-500">{pkg.downloads.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
