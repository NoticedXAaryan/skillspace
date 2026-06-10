import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Package, HardDrive, Settings, LogOut, ArrowRight, Activity, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect('/login');
  }

  // Fetch user data with quotas
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      packages: {
        orderBy: { createdAt: 'desc' },
        include: { versions: true }
      }
    }
  });

  if (!user) {
    redirect('/login');
  }

  const storageUsed = Number(user.storageUsed || 0);
  const storageQuota = Number(user.storageQuota || 10 * 1024 * 1024 * 1024); // default 10GB
  const storagePercent = Math.min(100, (storageUsed / storageQuota) * 100);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalDownloads = user.packages.reduce((sum, pkg) => sum + (pkg.downloads || 0), 0);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-12 md:py-24">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome, {user.name}</h1>
            <p className="text-neutral-400">Manage your published skills, agents, and storage.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <Button asChild variant="outline" className="border-white/10 bg-neutral-900 hover:bg-neutral-800">
              <Link href="/create">Publish New Package</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="rounded-xl border border-white/10 bg-neutral-950 p-6 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-1">Total Packages</h3>
              <p className="text-3xl font-bold">{user.packages.length}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-neutral-950 p-6 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-1">Total Downloads</h3>
              <p className="text-3xl font-bold">{totalDownloads.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-neutral-950 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-1">Storage Quota</h3>
                <p className="text-xl font-bold">
                  {formatBytes(storageUsed)} <span className="text-neutral-500 text-sm font-normal">/ {formatBytes(storageQuota)}</span>
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <Progress value={storagePercent} className="h-2" />
            <p className="text-xs text-neutral-500 mt-2">{storagePercent.toFixed(1)}% used</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Your Packages
          </h2>
          
          {user.packages.length === 0 ? (
            <div className="rounded-xl border border-white/10 border-dashed bg-neutral-950/50 p-12 text-center">
              <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No packages published yet</h3>
              <p className="text-neutral-400 mb-6 max-w-sm mx-auto">
                Use the CLI to publish your first skill, agent, or workflow to the registry.
              </p>
              <div className="bg-neutral-900 border border-white/10 inline-flex items-center px-4 py-2 rounded-md text-sm font-mono text-neutral-300">
                <span className="text-neutral-500 mr-2">$</span> air publish
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {user.packages.map((pkg) => (
                <Link href={`/packages/${pkg.name.replace('@', '').replace('/', '-')}`} key={pkg.id}>
                  <div className="group rounded-xl border border-white/10 bg-neutral-950 p-6 hover:border-cyan-500/50 transition-colors flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{pkg.name}</h3>
                      <p className="text-neutral-400 text-sm">{pkg.description}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-neutral-500">
                      <div className="flex flex-col md:items-end">
                        <span className="font-medium text-neutral-300">{pkg.downloads}</span>
                        <span>downloads</span>
                      </div>
                      <div className="flex flex-col md:items-end">
                        <span className="font-medium text-neutral-300">{pkg.type}</span>
                        <span>type</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-cyan-400 transition-colors hidden md:block" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
