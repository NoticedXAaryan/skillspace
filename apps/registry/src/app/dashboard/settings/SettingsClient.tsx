'use client';

import { Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsClientProps {
  user: { name: string; email: string; username: string | null; plan: string };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-neutral-400 mt-1">Manage your account settings.</p>
      </div>

      {/* Profile */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Name</span>
            <span className="text-sm text-white">{user.name || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Email</span>
            <span className="text-sm text-white">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Username</span>
            <span className="text-sm text-white font-mono">@{user.username || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Plan</span>
            <span className="text-sm text-cyan-400">{user.plan}</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/dashboard/keys"
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-cyan-500/30 transition-colors"
          >
            <p className="text-sm font-medium text-white">API Keys</p>
            <p className="text-xs text-neutral-400 mt-1">Configure model provider keys.</p>
          </a>
          <a
            href="/profile/2fa"
            className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-cyan-500/30 transition-colors"
          >
            <p className="text-sm font-medium text-white">Two-Factor Auth</p>
            <p className="text-xs text-neutral-400 mt-1">Secure your account with 2FA.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
