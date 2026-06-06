import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await context.params;

    const org = await prisma.organization.findUnique({
      where: { slug },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, email: true } } }
        }
      }
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Must be a member to list members
    const isMember = org.members.some(m => m.userId === user.userId);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ members: org.members });
  } catch (error) {
    console.error('Failed to fetch org members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, role } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const { slug } = await context.params;

    const org = await prisma.organization.findUnique({
      where: { slug },
      include: { members: true }
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Must be admin to add members
    const currentMember = org.members.find(m => m.userId === user.userId);
    if (!currentMember || currentMember.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { username }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add member
    const member = await prisma.orgMember.create({
      data: {
        organizationId: org.id,
        userId: targetUser.id,
        role: role || 'member'
      }
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Failed to add org member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
