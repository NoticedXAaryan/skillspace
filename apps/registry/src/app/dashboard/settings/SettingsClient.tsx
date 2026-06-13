'use client';

import { useState } from 'react';
import { Key, Globe, Cpu, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SettingsClientProps {
  user: { name: string; email: string; username: string | null; plan: string };
  settings: {
    openaiKey: boolean;
    anthropicKey: boolean;
    googleKey: boolean;
    ollamaUrl: string;
    defaultModel: string;
  };
}

export default function SettingsClient({ user, settings }: SettingsClientProps) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl);
  const [defaultModel, setDefaultModel] = useState(settings.defaultModel);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updates: Record<string, string> = {};
      if (openaiKey) updates.openaiKey = openaiKey;
      if (anthropicKey) updates.anthropicKey = anthropicKey;
      if (googleKey) updates.googleKey = googleKey;
      updates.ollamaUrl = ollamaUrl;
      updates.defaultModel = defaultModel;

      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      setSaved(true);
      setOpenaiKey('');
      setAnthropicKey('');
      setGoogleKey('');
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-neutral-400 mt-1">Configure your account and API keys.</p>
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

      {/* API Keys */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">API Keys</h2>
        <p className="text-sm text-neutral-400 mb-4">Configure keys for AI model providers. Used by the playground to execute skills.</p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
          {/* OpenAI */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-green-400" />
              <label className="text-sm font-medium text-white">OpenAI</label>
              {settings.openaiKey && !openaiKey && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </div>
            <Input
              type="password"
              placeholder={settings.openaiKey ? '••••••••••••••••' : 'sk-...'}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
            />
          </div>

          {/* Anthropic */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-orange-400" />
              <label className="text-sm font-medium text-white">Anthropic</label>
              {settings.anthropicKey && !anthropicKey && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </div>
            <Input
              type="password"
              placeholder={settings.anthropicKey ? '••••••••••••••••' : 'sk-ant-...'}
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
            />
          </div>

          {/* Google */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-blue-400" />
              <label className="text-sm font-medium text-white">Google AI</label>
              {settings.googleKey && !googleKey && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </div>
            <Input
              type="password"
              placeholder={settings.googleKey ? '••••••••••••••••' : 'AIza...'}
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
            />
          </div>

          {/* Ollama */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <label className="text-sm font-medium text-white">Ollama (Local)</label>
            </div>
            <Input
              placeholder="http://localhost:11434"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
            />
          </div>

          {/* Default Model */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <label className="text-sm font-medium text-white">Default Model</label>
            </div>
            <Input
              placeholder="e.g. openai/gpt-4o or anthropic/claude-3-5-sonnet"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          {saved ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <Save className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
