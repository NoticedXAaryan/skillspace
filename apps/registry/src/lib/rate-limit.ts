import prisma from './prisma';

export async function rateLimit(key: string, maxRequests: number, windowMs: number): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  
  // Clean up expired tokens periodically (could be done in a cron, but doing it opportunistically here)
  if (Math.random() < 0.01) {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => {});
  }

  let record = await prisma.rateLimit.findUnique({ where: { key } });

  if (!record || record.resetAt < now) {
    record = await prisma.rateLimit.upsert({
      where: { key },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) }
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record = await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } }
  });

  return { allowed: true, remaining: maxRequests - record.count };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return '127.0.0.1';
}
