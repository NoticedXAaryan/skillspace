import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    package: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    packageVersion: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
    }
  }
}));

vi.mock('@/lib/auth', () => ({
  getUserFromRequest: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ success: true, limit: 100, remaining: 99 }),
}));

vi.mock('@/lib/storage', () => ({
  storePackage: vi.fn().mockReturnValue('storage/path/to/pkg'),
}));

import { GET as packagesGET, POST as packagesPOST } from '../src/app/api/packages/route';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

describe('Registry API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/packages', () => {
    it('returns packages with pagination', async () => {
      vi.mocked(prisma.package.findMany).mockResolvedValue([
        {
          id: 'pkg-1',
          name: 'test-skill',
          type: 'skill',
          description: 'A test',
          tags: '["test"]',
          downloads: 10,
          ownerId: 'user-1',
          orgId: null,
          scope: null,
          verified: false,
          isPrivate: false,
          createdAt: new Date(),
          versions: [{ version: '1.0.0', publishedAt: new Date() } as any],
        }
      ]);
      vi.mocked(prisma.package.count).mockResolvedValue(1);

      const req = new NextRequest('http://localhost/api/packages?page=1&limit=10');
      const res = await packagesGET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe('test-skill');
      expect(json.data[0].latestVersion).toBe('1.0.0');
      expect(json.meta.total).toBe(1);
    });
  });

  describe('POST /api/packages', () => {
    it('requires authentication', async () => {
      vi.mocked(getUserFromRequest).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/packages', { method: 'POST' });
      const res = await packagesPOST(req);

      expect(res.status).toBe(401);
    });
  });
});
