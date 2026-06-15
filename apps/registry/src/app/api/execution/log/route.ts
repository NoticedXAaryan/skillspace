import { streamManager } from '@/lib/streamManager';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, type, data } = body;

    if (!projectId || !type) {
      return NextResponse.json({ error: 'Missing projectId or type' }, { status: 400 });
    }

    // Broadcast the event to any active SSE listeners for this project
    streamManager.broadcast(projectId, type, data);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to parse log ingestion body:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
