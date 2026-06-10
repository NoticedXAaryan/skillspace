import { loadCredentials, getRegistryUrl } from '@skillspace/runtime';
import * as os from 'os';
import * as crypto from 'crypto';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generates a lightweight anonymous device footprint 
 * based on hardware architecture and hostname to track CLI installations.
 */
function getDeviceFootprint(): string {
  const data = [
    os.platform(),
    os.arch(),
    os.hostname(),
    os.cpus()[0]?.model || 'unknown_cpu',
  ].join('|');
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * API client for the SkillSpace registry.
 */
export class RegistryClient {
  public baseUrl: string;
  private deviceFootprint: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getRegistryUrl();
    this.deviceFootprint = getDeviceFootprint();
  }

  private getHeaders(auth = false): Record<string, string> {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'X-Device-Footprint': this.deviceFootprint 
    };
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
    // Maps to Better-Auth API
    const res = await this.safeFetch(`${this.baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name: username, email, password }),
    });
    
    if (!res.ok) {
      const text = await res.text();
      return { error: { message: text || res.statusText } };
    }
    
    // Better-auth returns the token in the response JSON natively if configured,
    // or we can extract it from the response body.
    const data: any = await res.json();
    return { data: { token: data.token, user: data.user } };
  }

  async login(email: string, password: string): Promise<any> {
    // Maps to Better-Auth API
    const res = await this.safeFetch(`${this.baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: { message: text || res.statusText } };
    }
    
    const data: any = await res.json();
    return { data: { token: data.token, user: data.user } };
  }

  async me(): Promise<any> {
    const res = await this.safeFetch(`${this.baseUrl}/api/auth/get-session`, {
      headers: this.getHeaders(true),
    });
    
    if (!res.ok) {
      return { error: { message: 'Unauthorized' } };
    }
    
    const data: any = await res.json();
    if (!data || !data.user) return { error: { message: 'Invalid session' } };
    
    // Map Better-Auth user schema back to expected CLI schema
    return { data: { username: data.user.name, email: data.user.email, plan: 'Free' } };
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
    delete headers['Content-Type']; // Let fetch set the boundary

    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    
    // We append the file buffer as a Blob
    formData.append('file', new Blob([file], { type: 'application/gzip' }), 'package.tar.gz');

    const res = await this.safeFetch(`${this.baseUrl}/api/packages`, {
      method: 'POST',
      headers,
      body: formData,
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
