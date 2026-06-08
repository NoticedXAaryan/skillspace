import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let onboarding = await prisma.userOnboarding.findUnique({
      where: { userId: user.userId },
    });

    if (!onboarding) {
      onboarding = await prisma.userOnboarding.create({
        data: { userId: user.userId },
      });
    }

    return NextResponse.json({ data: onboarding });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch onboarding state' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const updateData: any = {};
    if (typeof body.walkthroughCompleted === 'boolean') updateData.walkthroughCompleted = body.walkthroughCompleted;
    if (typeof body.firstSkillInstalled === 'boolean') updateData.firstSkillInstalled = body.firstSkillInstalled;
    if (typeof body.firstSkillRun === 'boolean') updateData.firstSkillRun = body.firstSkillRun;
    if (typeof body.firstSkillPublished === 'boolean') updateData.firstSkillPublished = body.firstSkillPublished;
    if (typeof body.onboardingCompleted === 'boolean') updateData.onboardingCompleted = body.onboardingCompleted;
    if (typeof body.currentStep === 'number') updateData.currentStep = body.currentStep;

    const onboarding = await prisma.userOnboarding.update({
      where: { userId: user.userId },
      data: updateData,
    });

    return NextResponse.json({ data: onboarding });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update onboarding state' }, { status: 500 });
  }
}
