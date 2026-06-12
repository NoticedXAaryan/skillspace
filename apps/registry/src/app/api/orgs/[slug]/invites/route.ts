import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { createInvite } from '@/lib/invites';

export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await props.params;
    const body = await request.json().catch(() => ({}));
    const { role = 'member' } = body;

    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Verify user is admin of the org
    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: user.userId
        }
      }
    });

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can generate invites' }, { status: 403 });
    }

    const invite = await createInvite(org.id, role, 24);

    return NextResponse.json({ token: invite.token, expires_in: '24h' });
  } catch (error) {
    console.error('Failed to generate invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
