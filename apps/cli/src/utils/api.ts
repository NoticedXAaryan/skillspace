import { loadCredentials, getRegistryUrl } from '@skillspace/runtime';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * API client for the SkillSpace registry.
 */
export class RegistryClient {
  public baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getRegistryUrl();
  }

  private getHeaders(auth = false): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = loadCredentials();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async register(username: string, email: string, password: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  }

  async login(email: string, password: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }

  async me(): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: this.getHeaders(true),
    });
    return res.json();
  }

  async search(query: string, type?: string): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (type) params.set('type', type);
    const res = await fetch(`${this.baseUrl}/api/search?${params.toString()}`);
    return res.json();
  }

  async getPackage(name: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/api/packages/${encodeURIComponent(name)}`);
    return res.json();
  }

  async getVersions(name: string): Promise<any> {
    const res = await fetch(
      `${this.baseUrl}/api/packages/${encodeURIComponent(name)}/versions`,
    );
    return res.json();
  }

  async downloadPackage(
    name: string,
    version: string,
  ): Promise<{ buffer: Buffer; checksum: string }> {
    const res = await fetch(
      `${this.baseUrl}/api/packages/${encodeURIComponent(name)}/${encodeURIComponent(version)}/download`,
    );
    if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const checksum = res.headers.get('X-Checksum') || '';
    return { buffer, checksum };
  }

  async publish(file: Buffer, metadata: Record<string, unknown>): Promise<any> {
    const formData = new FormData();
    formData.append('file', new Blob([new Uint8Array(file)]), 'package.skillpkg');
    formData.append('metadata', JSON.stringify(metadata));

    const headers: Record<string, string> = {};
    const token = loadCredentials();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.baseUrl}/api/packages`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  }
}
