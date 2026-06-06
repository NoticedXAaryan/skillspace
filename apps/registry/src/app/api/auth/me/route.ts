import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { success, unauthorized } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, username: true, email: true, plan: true, verified: true, createdAt: true },
  });
  if (!user) return unauthorized('User not found');

  return success(user);
}
