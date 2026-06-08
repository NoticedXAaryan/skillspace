import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, signJwt } from '@/lib/auth';
import { success, error, rateLimited } from '@/lib/api-response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const RegisterSchema = z.object({
  username: z.string().min(3).max(39).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = await rateLimit(`register:${ip}`, 3, 3600000);
  if (!allowed) return rateLimited('Registration limit exceeded. Try again later.');

  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return error('VALIDATION_ERROR', 'Invalid input', 400, parsed.error.flatten());
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    const field = existing.username === username ? 'username' : 'email';
    return error('CONFLICT', `A user with this ${field} already exists`, 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
  });

  const token = signJwt({ userId: user.id, username: user.username, email: user.email });
  return success({ token, user: { id: user.id, username: user.username, email: user.email } });
}
