import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ChatMessage } from '@skillspace/schema';
import { ensureSkillspaceDir, getRegistryPath } from './config.js';

export class SessionManager {
  private sessionsDir: string;

  constructor() {
    // We store sessions in ~/.skillspace/sessions
    const baseDir = path.dirname(getRegistryPath());
    this.sessionsDir = path.join(baseDir, 'sessions');
    if (!fs.existsSync(this.sessionsDir)) {
      ensureSkillspaceDir();
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  private getSessionFile(sessionId: string): string {
    return path.join(this.sessionsDir, `${sessionId}.json`);
  }

  loadSession(sessionId: string): ChatMessage[] {
    const file = this.getSessionFile(sessionId);
    if (!fs.existsSync(file)) {
      return [];
    }
    try {
      const data = fs.readFileSync(file, 'utf-8');
      return JSON.parse(data) as ChatMessage[];
    } catch {
      return [];
    }
  }

  saveSession(sessionId: string, messages: ChatMessage[]): void {
    const file = this.getSessionFile(sessionId);
    fs.writeFileSync(file, JSON.stringify(messages, null, 2), 'utf-8');
  }

  deleteSession(sessionId: string): void {
    const file = this.getSessionFile(sessionId);
    if (fs.existsSync(file)) {
      fs.rmSync(file);
    }
  }
}
