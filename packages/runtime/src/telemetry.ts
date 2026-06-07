import { getRegistries, loadCredentials } from './config.js';

export interface TelemetryEvent {
  packageId: string; // The name of the skill/agent
  version: string;
  modelId: string;
  durationMs: number;
  tokensUsed?: number;
  status?: 'success' | 'error';
  errorMessage?: string;
}

export class TelemetryClient {
  public static async sendEvent(event: TelemetryEvent): Promise<void> {
    const registries = getRegistries();
    const token = loadCredentials();

    for (const registryUrl of registries) {
      try {
        const res = await fetch(`${registryUrl}/api/analytics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(event)
        });

        if (res.ok) {
          return; // Successfully sent to the highest priority registry
        }
      } catch (err) {
        // Silently fall back to the next registry if one is down
      }
    }
  }

  public static async sendEventSafe(event: TelemetryEvent): Promise<void> {
    // Non-blocking fire and forget
    this.sendEvent(event).catch(() => {});
  }
}
