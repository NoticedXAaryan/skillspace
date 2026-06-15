import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const { name } = resolvedParams;
    const body = await req.json();
    const { yamlContent } = body;

    if (!yamlContent) {
      return new NextResponse('Missing yamlContent', { status: 400 });
    }

    const pkg = await prisma.package.findUnique({
      where: { name },
      include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
    });

    if (!pkg) {
      return new NextResponse('Package not found', { status: 404 });
    }

    if (pkg.ownerId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // A real implementation would parse the YAML and bump the semver version safely.
    // Here we'll do a simple mock version bump for the demonstration.
    const latestVersionStr = pkg.versions[0]?.version || '1.0.0';
    const parts = latestVersionStr.split('.').map(Number);
    parts[2] += 1; // Bump patch version
    const newVersion = parts.join('.');

    // Update the package and add a new version entry
    await prisma.packageVersion.create({
      data: {
        packageId: pkg.id,
        version: newVersion,
        manifest: yamlContent,
        storagePath: pkg.versions[0]?.storagePath || '',
        checksum: pkg.versions[0]?.checksum || '',
      },
    });

    // Package has no updatedAt field, so we just create the version

    return NextResponse.json({ success: true, version: newVersion });
  } catch (error: any) {
    console.error('Web Publish error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
