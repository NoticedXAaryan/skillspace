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
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user.name || user.email.split('@')[0]}
        </h1>
        <p className="text-neutral-400 mt-1">
          Here&apos;s what&apos;s happening with your packages.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {
            label: 'Total Packages',
            value: totalPackages,
            icon: Package,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
          },
          {
            label: 'Total Downloads',
            value: totalDownloads.toLocaleString(),
            icon: Download,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
          },
          {
            label: 'GitHub Linked',
            value: user.packages.filter((p) => p.githubUrl).length,
            icon: TrendingUp,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
          },
          {
            label: 'Account',
            value: user.plan,
            icon: Users,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 overflow-hidden hover:border-white/20 transition-all duration-300"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 rounded-full ${stat.bg} blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500`}
            />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="relative z-10 text-4xl font-bold text-white tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <a
          href="/dashboard/packages"
          className="group relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-blue-500/30 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="relative z-10 text-lg text-white font-bold mb-2 group-hover:text-blue-400 transition-colors">
            My Packages
          </h3>
          <p className="relative z-10 text-neutral-400">View and manage your published packages.</p>
        </a>
        <a
          href="/dashboard/playground"
          className="group relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 hover:border-purple-500/30 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="relative z-10 text-lg text-white font-bold mb-2 group-hover:text-purple-400 transition-colors">
            Playground
          </h3>
          <p className="relative z-10 text-neutral-400">Test your skills with real AI models.</p>
        </a>
      </div>

      {/* Recent Packages */}
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg font-bold text-white">Recent Packages</h2>
          <a
            href="/dashboard/packages"
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all →
          </a>
        </div>
        {user.packages.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 mb-4 text-lg">No packages published yet.</p>
            <a
              href="/create"
              className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Publish your first package <TrendingUp className="ml-2 w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {user.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white font-mono mb-1">{pkg.name}</p>
                    <p className="text-sm text-neutral-500">v{pkg.versions[0]?.version || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {pkg.githubUrl && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Verified
                    </span>
                  )}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{pkg.downloads}</p>
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Downloads</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
