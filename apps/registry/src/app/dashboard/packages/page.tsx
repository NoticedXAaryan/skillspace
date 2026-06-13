import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Package, ExternalLink, GitBranch } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'My Packages — SkillSpace',
};

export default async function PackagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const packages = await prisma.package.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      versions: { orderBy: { publishedAt: 'desc' }, take: 1 },
    },
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Packages</h1>
          <p className="text-neutral-400 mt-1">{packages.length} package{packages.length !== 1 ? 's' : ''} published</p>
        </div>
        <Link
          href="/create"
          className="px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors text-sm"
        >
          New Package
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-16 text-center">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No packages yet</h3>
          <p className="text-neutral-400 mb-4">Publish your first AI capability to get started.</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors text-sm"
          >
            Create Package
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 divide-y divide-white/10">
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <Link href={`/packages/${pkg.name}`} className="text-sm font-medium text-white hover:text-cyan-400 font-mono">
                    {pkg.name}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-0.5">{pkg.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-neutral-400">
                {pkg.githubUrl && (
                  <a href={pkg.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-400 hover:text-green-300">
                    <GitBranch className="w-3.5 h-3.5" />
                    Verified
                  </a>
                )}
                <span className="text-xs font-mono">v{pkg.versions[0]?.version || '—'}</span>
                <span className="text-xs">{pkg.downloads} ↓</span>
                <Link href={`/packages/${pkg.name}`} className="text-cyan-400 hover:text-cyan-300">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
