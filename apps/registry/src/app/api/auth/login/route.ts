import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword, signJwt } from '@/lib/auth';
import { success, error, rateLimited } from '@/lib/api-response';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed } = rateLimit(`login:${ip}`, 5, 900000);
  if (!allowed) return rateLimited('Too many login attempts. Try again in 15 minutes.');

  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return error('VALIDATION_ERROR', 'Invalid input', 400, parsed.error.flatten());
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return error('AUTH_FAILED', 'Invalid email or password', 401);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return error('AUTH_FAILED', 'Invalid email or password', 401);

  const token = signJwt({ userId: user.id, username: user.username, email: user.email });
  return success({ token, user: { id: user.id, username: user.username, email: user.email } });
}
