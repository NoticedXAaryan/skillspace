import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import * as yaml from 'js-yaml';
import semver from 'semver';
import * as crypto from 'node:crypto';
import { storePackage } from '@/lib/storage';

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

    let parsedYaml: Record<string, unknown>;
    try {
      const loaded = yaml.load(yamlContent);
      if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) {
        return new NextResponse('YAML content must be an object', { status: 400 });
      }
      parsedYaml = loaded as Record<string, unknown>;
    } catch {
      return new NextResponse('Invalid YAML format', { status: 400 });
    }

    const latestVersionStr = pkg.versions[0]?.version || '0.0.0';
    let newVersion: string | null = typeof parsedYaml.version === 'string' ? parsedYaml.version : null;

    if (newVersion) {
      if (!semver.valid(newVersion)) {
        return new NextResponse(`Invalid semver version in YAML: ${newVersion}`, { status: 400 });
      }
      if (semver.lte(newVersion, latestVersionStr)) {
        return new NextResponse(`Version must be strictly greater than ${latestVersionStr}`, { status: 400 });
      }
    } else {
      newVersion = semver.inc(latestVersionStr, 'patch');
      if (!newVersion) return new NextResponse('Failed to increment version', { status: 500 });
      parsedYaml.version = newVersion;
    }

    const existingVersion = await prisma.packageVersion.findFirst({
      where: { packageId: pkg.id, version: newVersion },
    });
    if (existingVersion) {
      return new NextResponse(`Version ${newVersion} already exists`, { status: 409 });
    }

    const buffer = Buffer.from(yamlContent, 'utf-8');
    const userStats = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { storageUsed: true, storageQuota: true },
    });
    if (userStats && userStats.storageUsed + BigInt(buffer.byteLength) > userStats.storageQuota) {
      return new NextResponse('Global storage quota exceeded', { status: 413 });
    }

    const checksum = `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;
    const storagePath = await storePackage(name, newVersion, buffer);

    await prisma.$transaction([
      prisma.packageVersion.create({
        data: {
          packageId: pkg.id,
          version: newVersion,
          manifest: JSON.stringify(parsedYaml),
          storagePath,
          checksum,
          size: buffer.byteLength,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { storageUsed: { increment: buffer.byteLength } }
      })
    ]);

    return NextResponse.json({ success: true, version: newVersion });
  } catch (error: any) {
    console.error('Web Publish error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
