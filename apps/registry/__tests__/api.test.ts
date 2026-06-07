import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => {
  return {
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
  };
});

vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  signJwt: vi.fn().mockReturnValue('mock-jwt-token'),
  getUserFromRequest: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}));

vi.mock('@/lib/storage', () => ({
  storePackage: vi.fn().mockReturnValue('storage/path/to/pkg'),
}));

import { POST as registerPOST } from '../src/app/api/auth/register/route';
import { POST as loginPOST } from '../src/app/api/auth/login/route';
import { GET as packagesGET, POST as packagesPOST } from '../src/app/api/packages/route';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

describe('Registry API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user successfully', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed',
        plan: 'free',
        verified: false,
        createdAt: new Date(),
      });

      const req = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const res = await registerPOST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.token).toBe('mock-jwt-token');
      expect(json.data.user.username).toBe('testuser');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('fails if user already exists', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed',
        plan: 'free',
        verified: false,
        createdAt: new Date(),
      });

      const req = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const res = await registerPOST(req);
      const json = await res.json();

      expect(res.status).toBe(409);
      expect(json.error.code).toBe('CONFLICT');
    });
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
      vi.mocked(getUserFromRequest).mockReturnValue(null);

      const req = new NextRequest('http://localhost/api/packages', { method: 'POST' });
      const res = await packagesPOST(req);
      
      expect(res.status).toBe(401);
    });

    it('publishes a new package', async () => {
      vi.mocked(getUserFromRequest).mockReturnValue({ userId: 'user-1', username: 'testuser', email: 'test@example.com' });
      
      const fileContent = Buffer.from('fake file content').toString('base64');

      const req = new NextRequest('http://localhost/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: fileContent,
          metadata: {
            name: 'new-skill',
            version: '1.0.0',
            description: 'New skill',
            type: 'skill',
          },
        }),
      });

      vi.mocked(prisma.package.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.package.create).mockResolvedValue({ id: 'pkg-1', name: 'new-skill' } as any);
      vi.mocked(prisma.packageVersion.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.packageVersion.create).mockResolvedValue({ version: '1.0.0' } as any);

      const res = await packagesPOST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.package).toBe('new-skill');
      expect(json.data.version).toBe('1.0.0');
      expect(prisma.package.create).toHaveBeenCalled();
      expect(prisma.packageVersion.create).toHaveBeenCalled();
    });
  });
});
