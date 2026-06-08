import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/v1/packages
// Fetch public packages with optional search and limit
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Only return public packages via API
    const packages = await prisma.package.findMany({
      where: {
        isPrivate: false,
        name: { contains: query },
      },
      take: Math.min(limit, 100),
      orderBy: { downloads: 'desc' },
      include: {
        owner: { select: { username: true } },
        versions: { orderBy: { publishedAt: 'desc' }, take: 1 }
      }
    });

    const response = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      owner: pkg.owner.username,
      latestVersion: pkg.versions[0]?.version || '0.0.0',
      downloads: pkg.downloads,
      createdAt: pkg.createdAt,

      tags: typeof pkg.tags === 'string' ? JSON.parse(pkg.tags || '[]') : pkg.tags
    }));

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        count: response.length,
        query
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
