import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { validateInvite, consumeInvite } from '@/lib/invites';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const invite = await validateInvite(token);
    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite token' }, { status: 400 });
    }

    await prisma.orgMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: invite.orgId,
          userId: user.userId
        }
      },
      update: {
        role: invite.role
      },
      create: {
        organizationId: invite.orgId,
        userId: user.userId,
        role: invite.role
      }
    });

    await consumeInvite(token);

    return NextResponse.json({ message: 'Successfully joined organization' });
  } catch (error) {
    console.error('Failed to accept invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
