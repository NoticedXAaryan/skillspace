import { streamManager } from '@/lib/streamManager';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return new Response('Missing projectId', { status: 400 });
  }

  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      streamManager.addConnection(projectId, controller);

      // Send initial connection success message
      const payload = `event: connected\ndata: {"status":"ok"}\n\n`;
      controller.enqueue(new TextEncoder().encode(payload));
    },
    cancel() {
      streamManager.removeConnection(projectId, controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
