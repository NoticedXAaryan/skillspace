import { NextResponse } from 'next/server';
import { streamManager } from '@/lib/streamManager';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { projectId, command } = body;

    if (!projectId || !command) {
      return new NextResponse('Missing projectId or command', { status: 400 });
    }

    // Push the command to the specific project ID stream.
    // The CLI running `skillspace listen` will receive this and execute it locally.
    streamManager.broadcast(projectId, 'command', { command });

    return NextResponse.json({ success: true, message: 'Command sent to CLI' });
  } catch (error: any) {
    console.error('Remote execution error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
