import prisma from './prisma';
import crypto from 'crypto';

export async function createInvite(orgId: string, role: string = 'member', expiresInHours: number = 24) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  const invite = await prisma.invite.create({
    data: {
      token,
      orgId,
      role,
      expiresAt
    }
  });
  
  return invite;
}

export async function validateInvite(token: string) {
  // Clean up expired tokens
  if (Math.random() < 0.1) {
    await prisma.invite.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
  }

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return null;
  if (invite.expiresAt < new Date()) {
    await prisma.invite.delete({ where: { id: invite.id } });
    return null;
  }
  return invite;
}

export async function consumeInvite(token: string) {
  await prisma.invite.delete({ where: { token } });
}
