import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Executor } from '@skillspace/runtime';
import { SkillSchema } from '@skillspace/schema';

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;

  let record = rateLimitMap.get(ip);
  if (!record || record.expiresAt < now) {
    record = { count: 1, expiresAt: now + windowMs };
    rateLimitMap.set(ip, record);
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const { skillName, version, input } = body;

    if (!skillName || !input) {
      return NextResponse.json({ error: 'skillName and input are required' }, { status: 400 });
    }

    // Fetch from database
    const pkg = await prisma.package.findUnique({
      where: { name: skillName },
      include: { versions: true }
    });

    if (!pkg) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    if (pkg.isPrivate) {
      return NextResponse.json({ error: 'Cannot run private skills in playground' }, { status: 403 });
    }

    // Find version
    let targetVersion = pkg.versions.find(v => v.version === version);
    if (!targetVersion && pkg.versions.length > 0) {
      // Use latest
      targetVersion = pkg.versions.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())[0];
    }

    if (!targetVersion) {
      return NextResponse.json({ error: 'Skill has no published versions' }, { status: 404 });
    }

    // Parse manifest
    const parsedManifest = typeof targetVersion.manifest === 'string' ? JSON.parse(targetVersion.manifest) : targetVersion.manifest;
    const skill = SkillSchema.parse(parsedManifest);

    // Create session record
    const session = await prisma.playgroundSession.create({
      data: {
        skillName,
        input,
        status: 'running',
        modelUsed: 'ollama/llama3.2',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      }
    });

    const executor = new Executor();
    
    // Create SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial session id
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'session', id: session.id })}\n\n`));

          // Run stream
          const generator = executor.runStream({
            skill: skillName,
            model: 'ollama/llama3.2',
            input: input,
          });

          let fullOutput = '';
          for await (const chunk of generator) {
            fullOutput += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: chunk })}\n\n`));
          }

          // Update session
          await prisma.playgroundSession.update({
            where: { id: session.id },
            data: { status: 'done', output: fullOutput }
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          await prisma.playgroundSession.update({
            where: { id: session.id },
            data: { status: 'error', error: errMsg }
          });
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: errMsg })}\n\n`));
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Playground API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
