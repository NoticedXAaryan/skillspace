import { NextRequest } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// Global in-memory store for rate limiting.
// Note: In a Serverless environment like Vercel, this is per-instance. 
// It works well enough for basic burst protection, but for cluster-wide rate limiting, use Redis.
const rateLimitCache = new Map<string, RateLimitEntry>();

export function checkRateLimit(req: NextRequest, limit: number, windowSecs: number): { success: boolean; limit: number; remaining: number } {
  const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
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
