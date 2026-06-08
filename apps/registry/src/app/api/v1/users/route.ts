import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/v1/users
// Search public user profiles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const users = await prisma.user.findMany({
      where: {
        username: { contains: username }
      },
      take: Math.min(limit, 50),
      select: {
        id: true,
        username: true,

        bio: true,
        createdAt: true,
        _count: {
          select: { packages: true }
        }
      }
    });

    const response = users.map(user => ({
      id: user.id,
      username: user.username,

      bio: user.bio,
      joinedAt: user.createdAt,
      stats: {
        packagesPublished: user._count.packages
      }
    }));

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
