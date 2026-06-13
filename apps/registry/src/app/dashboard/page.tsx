import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Package, Download, Users, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Dashboard — SkillSpace',
  description: 'Manage your AI capabilities.',
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      packages: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
      },
    },
  });

  if (!user) redirect('/');

  const totalDownloads = user.packages.reduce((acc, pkg) => acc + pkg.downloads, 0);
  const totalPackages = await prisma.package.count({ where: { ownerId: user.id } });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user.name || user.email.split('@')[0]}</h1>
        <p className="text-neutral-400 mt-1">Here&apos;s what&apos;s happening with your packages.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Packages', value: totalPackages, icon: Package, color: 'text-cyan-400' },
          { label: 'Total Downloads', value: totalDownloads.toLocaleString(), icon: Download, color: 'text-green-400' },
          { label: 'GitHub Linked', value: user.packages.filter(p => p.githubUrl).length, icon: TrendingUp, color: 'text-purple-400' },
          { label: 'Account', value: user.plan, icon: Users, color: 'text-orange-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <a
          href="/dashboard/packages"
          className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-500/30 transition-colors"
        >
          <h3 className="text-white font-semibold mb-1">My Packages</h3>
          <p className="text-sm text-neutral-400">View and manage your published packages.</p>
        </a>
        <a
          href="/dashboard/playground"
          className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-cyan-500/30 transition-colors"
        >
          <h3 className="text-white font-semibold mb-1">Playground</h3>
          <p className="text-sm text-neutral-400">Test your skills with real AI models.</p>
        </a>
      </div>

      {/* Recent Packages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Packages</h2>
          <a href="/dashboard/packages" className="text-sm text-cyan-400 hover:text-cyan-300">View all</a>
        </div>
        {user.packages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
            <Package className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400 mb-3">No packages published yet.</p>
            <a href="/create" className="text-sm text-cyan-400 hover:text-cyan-300">Publish your first package →</a>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 divide-y divide-white/10">
            {user.packages.map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white font-mono">{pkg.name}</p>
                    <p className="text-xs text-neutral-500">v{pkg.versions[0]?.version || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {pkg.githubUrl && (
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Verified</span>
                  )}
                  <span className="text-xs text-neutral-500">{pkg.downloads} downloads</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
