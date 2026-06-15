type Connection = {
  controller: ReadableStreamDefaultController;
};

class StreamManager {
  private connections: Map<string, Connection[]> = new Map();

  addConnection(sessionId: string, controller: ReadableStreamDefaultController) {
    if (!this.connections.has(sessionId)) {
      this.connections.set(sessionId, []);
    }
    this.connections.get(sessionId)!.push({ controller });
  }

  removeConnection(sessionId: string, controller: ReadableStreamDefaultController) {
    if (!this.connections.has(sessionId)) return;
    const connections = this.connections.get(sessionId)!;
    const index = connections.findIndex((c) => c.controller === controller);
    if (index !== -1) {
      connections.splice(index, 1);
    }
    if (connections.length === 0) {
      this.connections.delete(sessionId);
    }
  }

  broadcast(sessionId: string, event: string, data: any) {
    if (!this.connections.has(sessionId)) return;
    
    const connections = this.connections.get(sessionId)!;
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(payload);

    connections.forEach((conn) => {
      try {
        conn.controller.enqueue(encoded);
      } catch (err) {
        console.error('Failed to enqueue to stream', err);
      }
    });
  }
}

// Global instance to persist across HMR in dev
const globalForStreamManager = globalThis as unknown as {
  streamManager: StreamManager | undefined;
};

export const streamManager = globalForStreamManager.streamManager ?? new StreamManager();

if (process.env.NODE_ENV !== "production") {
  globalForStreamManager.streamManager = streamManager;
}
