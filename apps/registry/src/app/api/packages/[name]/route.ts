import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, notFound } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    const pkg = await prisma.package.findUnique({
      where: { name },
      include: {
        owner: { select: { id: true, username: true } },
        versions: { orderBy: { publishedAt: 'desc' } },
        benchmarks: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!pkg) return notFound(`Package "${name}" not found`);

    if (pkg.isPrivate) {
      const user = getUserFromRequest(_req);
      if (!user) {
        return new Response(JSON.stringify({ error: { message: 'Unauthorized. This package is private.' } }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (pkg.orgId) {
        const isMember = await prisma.organizationMember.findUnique({
          where: { userId_organizationId: { userId: user.userId, organizationId: pkg.orgId } }
        });
        if (!isMember && pkg.ownerId !== user.userId) {
          return new Response(JSON.stringify({ error: { message: 'Forbidden' } }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }
      } else if (pkg.ownerId !== user.userId) {
        return new Response(JSON.stringify({ error: { message: 'Forbidden' } }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
    }

    await prisma.package.update({ where: { id: pkg.id }, data: { downloads: { increment: 1 } } });

    const safeParse = (str: any, fallback: any) => {
      try { return typeof str === 'string' ? JSON.parse(str) : str || fallback; }
      catch { return fallback; }
    };

    return success({
      ...pkg,
      tags: safeParse(pkg.tags, []),
      latestVersion: pkg.versions[0]
        ? { ...pkg.versions[0], manifest: safeParse(pkg.versions[0].manifest, {}) }
        : null,
      allVersions: pkg.versions.map(v => ({
        version: v.version,
        publishedAt: v.publishedAt
      }))
    });
  } catch (error) {
    console.error(`[API Error] GET /packages/[name]`, error);
    return new Response(JSON.stringify({ error: { message: 'Internal Server Error' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
