import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens.' }, { status: 400 });
    }

    // Check if slug is taken
    const existing = await prisma.organization.findUnique({
      where: { slug }
    });

    if (existing) {
      return NextResponse.json({ error: 'Slug is already taken' }, { status: 400 });
    }

    // Create org and add creator as admin
    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: user.userId,
            role: 'admin'
          }
        }
      }
    });

    return NextResponse.json({ org });
  } catch (error) {
    console.error('Failed to create org:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List orgs the user is a member of
    const members = await prisma.orgMember.findMany({
      where: { userId: user.userId },
      include: { 
        organization: {
          include: {
            packages: { include: { versions: { orderBy: { publishedAt: 'desc' }, take: 1 } } },
            members: { include: { user: { select: { id: true, username: true, email: true } } } }
          }
        } 
      }
    });

    const orgs = members.map(m => m.organization);

    return NextResponse.json({ orgs });
  } catch (error) {
    console.error('Failed to fetch orgs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
