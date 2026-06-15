import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import YamlEditor from '@/components/YamlEditor';

export const metadata = {
  title: 'Edit Package | SkillSpace',
};

// Next 15 `page.tsx` dynamic segments need to be destructured from `params` Promise.
// But we'll just extract `name`
export default async function EditPackagePage({ params }: { params: Promise<{ name: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const resolvedParams = await params;
  const { name } = resolvedParams;

  // Find the package and check authorization
  const pkg = await prisma.package.findUnique({
    where: { name },
    include: {
      owner: true,
      versions: {
        orderBy: { publishedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!pkg) notFound();
  if (pkg.ownerId !== session.user.id) redirect('/dashboard/packages');

  const latestVersion = pkg.versions[0];
  const initialCode = latestVersion?.manifest || `name: ${name}\nversion: 1.0.0\ntype: skill\ndescription: ""\n`;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit: {name}</h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Make changes to your skill definition right from the web.
          </p>
        </div>
      </div>

      <YamlEditor initialCode={initialCode} packageName={name} />
    </div>
  );
}
