import { NextResponse } from 'next/server';
import { streamManager } from '@/lib/streamManager';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get('projectId');

  if (!projectId) {
    return new NextResponse('Missing projectId', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      streamManager.addConnection(projectId, controller);

      // Send initial connection event
      const connectEvent = `event: connected\ndata: ${JSON.stringify({ status: 'ok' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectEvent));
    },
    cancel(controller) {
      streamManager.removeConnection(projectId, controller);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
