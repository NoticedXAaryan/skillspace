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

  private async safeFetch(url: string, init?: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (err: any) {
      if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
        throw new Error(`Could not connect to the registry at ${this.baseUrl}. Is your internet down or the server offline?`);
      }
      throw err;
    }
  }

  async register(username: string, email: string, password: string): Promise<any> {
    console.log(`[DEBUG] Fetching ${this.baseUrl}/api/auth/register`);
    const res = await this.safeFetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  }

  async login(email: string, password: string): Promise<any> {
    const res = await this.safeFetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  }

  async me(): Promise<any> {
    const res = await this.safeFetch(`${this.baseUrl}/api/auth/me`, {
      headers: this.getHeaders(true),
    });
    return res.json();
  }

  async search(query: string, type?: string): Promise<any> {
    const params = new URLSearchParams({ q: query });
    if (type) params.set('type', type);
    const res = await this.safeFetch(`${this.baseUrl}/api/search?${params.toString()}`);
    return res.json();
  }

  async getPackage(name: string): Promise<any> {
    const res = await this.safeFetch(`${this.baseUrl}/api/packages/${encodeURIComponent(name)}`);
    return res.json();
  }

  async getVersions(name: string): Promise<any> {
    const res = await this.safeFetch(
      `${this.baseUrl}/api/packages/${encodeURIComponent(name)}/versions`,
    );
    return res.json();
  }

  async downloadPackage(
    name: string,
    version: string,
  ): Promise<{ buffer: Buffer; checksum: string }> {
    const res = await this.safeFetch(
      `${this.baseUrl}/api/packages/${encodeURIComponent(name)}/${encodeURIComponent(version)}/download`,
    );
    if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const checksum = res.headers.get('X-Checksum') || '';
    return { buffer, checksum };
  }

  async publish(file: Buffer, metadata: Record<string, unknown>): Promise<any> {
    const headers = this.getHeaders(true);
    const body = JSON.stringify({
      file: file.toString('base64'),
      metadata,
    });

    const res = await this.safeFetch(`${this.baseUrl}/api/packages`, {
      method: 'POST',
      headers,
      body,
    });
    return res.json();
  }

  async createOrg(name: string, slug: string): Promise<any> {
    const res = await this.safeFetch(`${this.baseUrl}/api/orgs`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ name, slug }),
    });
    return res.json();
  }

  async createOrgInvite(slug: string, role: string = 'member'): Promise<any> {
    const res = await this.safeFetch(`${this.baseUrl}/api/orgs/${encodeURIComponent(slug)}/invites`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ role }),
    });
    return res.json();
  }

  async acceptOrgInvite(token: string): Promise<any> {
    const res = await this.safeFetch(`${this.baseUrl}/api/orgs/invites/accept`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ token }),
    });
    return res.json();
  }
}
