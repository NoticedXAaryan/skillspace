import { NextResponse } from 'next/server';

export function success<T>(data: T, meta?: { page: number; limit: number; total: number }) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) });
}

export function error(code: string, message: string, status: number = 400, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function unauthorized(message = 'Authentication required') {
  return error('UNAUTHORIZED', message, 401);
}

export function notFound(message = 'Resource not found') {
  return error('NOT_FOUND', message, 404);
}

export function rateLimited(message = 'Too many requests') {
  return error('RATE_LIMITED', message, 429);
}
