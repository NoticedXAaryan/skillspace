import { NextRequest } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitCache = new Map<string, RateLimitEntry>();

export function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || '127.0.0.1';
}

export function checkRateLimit(req: NextRequest, limit: number, windowSecs: number): { success: boolean; limit: number; remaining: number } {
  const ip = getClientIp(req);
  const now = Date.now();
  const windowMs = windowSecs * 1000;

  let entry = rateLimitCache.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  entry.count += 1;
  rateLimitCache.set(ip, entry);

  return {
    success: entry.count <= limit,
    limit,
    remaining: Math.max(0, limit - entry.count)
  };
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  let entry = rateLimitCache.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  entry.count += 1;
  rateLimitCache.set(key, entry);

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
  };
}
