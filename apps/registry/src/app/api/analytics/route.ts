import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { packageId, version, userId, orgId, modelId, durationMs, tokensUsed, status, errorMessage } = body;

    if (!packageId || !version || !modelId) {
      return NextResponse.json(
        { error: { message: 'Missing required telemetry fields.' } },
        { status: 400 }
      );
    }

    const packageRecord = await prisma.package.findUnique({
      where: { name: packageId }
    });

    if (!packageRecord) {
      return NextResponse.json(
        { error: { message: `Package ${packageId} not found in registry.` } },
        { status: 404 }
      );
    }

    const log = await prisma.executionLog.create({
      data: {
        packageId: packageRecord.id,
        version,
        userId: userId || null,
        orgId: orgId || null,
        modelId,
        durationMs,
        tokensUsed: tokensUsed || 0,
        status: status || 'success',
        errorMessage: errorMessage || null,
      },
    });

    return NextResponse.json({ success: true, id: log.id });
  } catch (error) {
    console.error('Failed to log telemetry:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error.' } },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Basic aggregation for the dashboard
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    // In a real app we'd verify the user is an admin or org member.
    // For now we just return the latest logs.
    const logs = await prisma.executionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        package: { select: { name: true } },
        user: { select: { username: true } },
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error.' } },
      { status: 500 }
    );
  }
}
