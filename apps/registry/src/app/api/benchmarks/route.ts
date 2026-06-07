import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }
    const body = await req.json();
    const { packageId, version, suiteName, score, passedCount, totalCount } = body;

    if (!packageId || !version || !suiteName || score === undefined) {
      return NextResponse.json(
        { error: { message: 'Missing required benchmark fields.' } },
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

    // Upsert the score for this specific package + version + suite
    const benchmarkScore = await prisma.benchmarkScore.upsert({
      where: {
        packageId_version_suiteName: {
          packageId: packageRecord.id,
          version,
          suiteName
        }
      },
      update: {
        score,
        passedCount,
        totalCount,
        createdAt: new Date()
      },
      create: {
        packageId: packageRecord.id,
        version,
        suiteName,
        score,
        passedCount,
        totalCount
      }
    });

    return NextResponse.json({ success: true, id: benchmarkScore.id });
  } catch (error) {
    console.error('Failed to save benchmark score:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error.' } },
      { status: 500 }
    );
  }
}
