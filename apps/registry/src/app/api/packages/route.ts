import { NextRequest } from 'next/server';
import { z } from 'zod';
import * as crypto from 'node:crypto';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized } from '@/lib/api-response';
import { storePackage } from '@/lib/storage';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  // Allow 100 requests per minute per IP for GET requests
  const rl = checkRateLimit(req, 100, 60);
  if (!rl.success) return error('TOO_MANY_REQUESTS', 'Rate limit exceeded. Try again later.', 429);

  const url = new URL(req.url);
  const type = url.searchParams.get('type') || undefined;
  const sort = url.searchParams.get('sort') || 'popular';
  let page = parseInt(url.searchParams.get('page') || '1');
  if (isNaN(page)) page = 1;
  page = Math.max(1, page);

  let limit = parseInt(url.searchParams.get('limit') || '20');
  if (isNaN(limit)) limit = 20;
  limit = Math.min(100, Math.max(1, limit));

  const skip = (page - 1) * limit;

  const where = type ? { type } : {};
  let orderBy: any = { downloads: 'desc' };
  if (sort === 'recent') orderBy = { createdAt: 'desc' };
  if (sort === 'name') orderBy = { name: 'asc' };

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } },
    }),
    prisma.package.count({ where }),
  ]);

  const safeParse = (str: any, fallback: any) => {
    try { return typeof str === 'string' ? JSON.parse(str) : str || fallback; }
    catch { return fallback; }
  };

  return success(
    packages.map((p) => ({
      ...p,
      tags: safeParse(p.tags, []),
      latestVersion: p.versions[0]?.version,
    })),
    { page, limit, total },
  );
}

export async function POST(req: NextRequest) {
  // Allow 15 requests per minute per IP for Publishing
  const rl = checkRateLimit(req, 15, 60);
  if (!rl.success) return error('TOO_MANY_REQUESTS', 'Publish rate limit exceeded. Try again later.', 429);

  const auth = getUserFromRequest(req);
  if (!auth) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const metadataStr = formData.get('metadata') as string | null;

    if (!file || !metadataStr) {
      return error('VALIDATION_ERROR', 'Both file and metadata are required', 400);
    }
    
    let metadata: Record<string, unknown>;
    try {
      metadata = JSON.parse(metadataStr);
    } catch (e) {
      return error('VALIDATION_ERROR', 'Invalid JSON in metadata', 400);
    }

    const MetadataSchema = z.object({
      name: z.string().min(1).regex(/^(@[a-z0-9-]+\/)?[a-z][a-z0-9]*(-[a-z0-9]+)*$/),
      version: z.string().regex(/^\d+\.\d+\.\d+$/),
      description: z.string().min(1).max(200),
      type: z.enum(['skill', 'agent', 'workflow', 'mcp', 'knowledge']).default('skill'),
      tags: z.array(z.string()).max(10).default([]),
      manifest: z.record(z.unknown()).optional(),
      isPrivate: z.boolean().optional().default(false),
    });

    const parsed = MetadataSchema.safeParse(metadata);
    if (!parsed.success) {
      return error('VALIDATION_ERROR', 'Invalid metadata', 400, parsed.error.flatten());
    }

    const { name, version, description, type, tags, isPrivate, manifest } = parsed.data;

    // --- SECURITY SCANNING ---
    // Enforce prompt injection firewall at publish time for v2 Skills
    if (type === 'skill' && manifest && 'persona' in manifest) {
      const { scanPersona } = await import('@skillspace/runtime');
      const persona = manifest.persona as any;
      const scan = scanPersona({
        system_prompt: persona?.system_prompt || '',
        behavioral_guidelines: persona?.behavioral_guidelines || []
      });

      if (scan.status === 'BLOCKED') {
        return error(
          'SECURITY_BLOCKED', 
          'Package blocked: Critical prompt injection patterns detected in persona', 
          403, 
          scan.findings
        );
      }
      // Note: WARNING level findings are allowed through but could be flagged 
      // in a future registry schema update.
    }
    // -------------------------

    // Check individual file size limit (50 MB)
    const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_UPLOAD_SIZE) {
      return error('PAYLOAD_TOO_LARGE', `File size exceeds the 50MB limit (Upload: ${(file.size / 1024 / 1024).toFixed(2)}MB)`, 413);
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Compute checksum
    const checksum = `sha256:${crypto.createHash('sha256').update(buffer).digest('hex')}`;

    // Handle scope and naming
    let scope: string | null = null;
    let packageName = name;
    let orgId: string | null = null;

    if (name.startsWith('@')) {
      const parts = name.substring(1).split('/');
      scope = parts[0];
      packageName = parts[1];

      // If scope is not the user's username, verify org membership
      const user = await prisma.user.findUnique({ where: { id: auth.userId } });
      if (user?.username !== scope) {
        const org = await prisma.organization.findUnique({
          where: { slug: scope },
          include: { members: true }
        });

        if (!org) {
          return error('NOT_FOUND', `Organization @${scope} does not exist. (If this is your username, please update your profile)`, 404);
        }

        const isMember = org.members.some(m => m.userId === auth.userId);
        if (!isMember) {
          return error('FORBIDDEN', `You are not a member of @${scope}`, 403);
        }
        orgId = org.id;
      }
    } else {
      // Reject unscoped global packages for security
      return error('VALIDATION_ERROR', 'All packages must be scoped (e.g. @yourname/package)', 400);
    }

    // Check Global Storage Quota
    const userStats = await prisma.user.findUnique({ where: { id: auth.userId }, select: { storageUsed: true, storageQuota: true } });
    if (userStats) {
      if (BigInt(userStats.storageUsed) + BigInt(file.size) > BigInt(userStats.storageQuota)) {
        return error('PAYLOAD_TOO_LARGE', 'Global storage quota exceeded. Upgrade your account or delete old packages.', 413);
      }
    }

    // Store the file
    const storagePath = await storePackage(name, version, buffer);

    // Upsert package
    let pkg = await prisma.package.findUnique({ where: { name } });
    if (!pkg) {
      pkg = await prisma.package.create({
        data: {
          name,
          scope,
          orgId,
          type,
          ownerId: auth.userId,
          description,
          isPrivate,
          tags: JSON.stringify(tags),
        },
      });
    } else {
      if (scope) {
        // Scoped package ownership is governed by org membership, already checked above
      } else if (pkg.ownerId !== auth.userId) {
        return error('FORBIDDEN', 'You do not own this package', 403);
      }
    }

    // Check for existing version
    const existingVersion = await prisma.packageVersion.findFirst({
      where: { packageId: pkg.id, version },
    });
    if (existingVersion) {
      return error('CONFLICT', `Version ${version} already exists`, 409);
    }

    // Create version
    const pkgVersion = await prisma.packageVersion.create({
      data: {
        packageId: pkg.id,
        version,
        manifest: JSON.stringify(parsed.data.manifest || {}),
        storagePath,
        checksum,
        size: file.size,
      },
    });

    // Update package description, tags, and user's storage quota
    await prisma.$transaction([
      prisma.package.update({
        where: { id: pkg.id },
        data: { description, tags: JSON.stringify(tags) },
      }),
      prisma.user.update({
        where: { id: auth.userId },
        data: { storageUsed: { increment: file.size } }
      })
    ]);

    return success({ package: pkg.name, version: pkgVersion.version, checksum });
  } catch (err) {
    console.error('Publish error:', err);
    return error('INTERNAL_ERROR', 'Failed to publish package', 500);
  }
}
