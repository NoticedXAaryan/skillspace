import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const limit = await rateLimit(`telemetry:${ip}`, 60, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const { event, data } = body;

    if (!event) {
      return NextResponse.json({ error: 'event is required' }, { status: 400 });
    }

    const fingerprint = req.headers.get('x-device-footprint') || 'unknown';

    // Store telemetry event as an execution log if it's a run event
    if (event === 'run_start' || event === 'run_complete' || event === 'run_error') {
      const { skillName, model, durationMs, tokensUsed, status, errorMessage, userId } = data || {};

      if (skillName && userId) {
        const pkg = await prisma.package.findUnique({
          where: { name: skillName },
          select: { id: true },
        });

        if (pkg) {
          await prisma.executionLog.create({
            data: {
              packageId: pkg.id,
              version: data?.version || '0.0.0',
              userId,
              modelId: model || 'unknown',
              durationMs: durationMs || 0,
              tokensUsed: tokensUsed || 0,
              status: status || 'success',
              errorMessage,
            },
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telemetry error:', error);
    return NextResponse.json({ ok: true }); // Don't fail on telemetry errors
  }
}
