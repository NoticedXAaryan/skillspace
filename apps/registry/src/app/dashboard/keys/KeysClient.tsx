'use client';

import { useState } from 'react';
import { Key, Globe, Cpu, Save, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface KeysClientProps {
  settings: {
    openaiKey: boolean;
    anthropicKey: boolean;
    googleKey: boolean;
    ollamaUrl: string;
    defaultModel: string;
  };
}

export default function KeysClient({ settings }: KeysClientProps) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState(settings.ollamaUrl);
  const [defaultModel, setDefaultModel] = useState(settings.defaultModel);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShow = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="text-neutral-400 mt-1">Configure keys for AI model providers. Used by the playground and CLI to execute skills.</p>
      </div>

      {/* Status Banner */}
      {!settings.openaiKey && !settings.anthropicKey && !settings.googleKey && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-300">No API keys configured</p>
            <p className="text-xs text-amber-400/70 mt-1">Add at least one provider key to use the playground and CLI execution features.</p>
          </div>
        </div>
      )}

      {/* Keys */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
        {/* OpenAI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-green-400" />
              <label className="text-sm font-medium text-white">OpenAI</label>
              {settings.openaiKey && !openaiKey && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </div>
          </div>
          <div className="relative">
            <Input
              type={showKeys.openai ? 'text' : 'password'}
              placeholder={settings.openaiKey ? '••••••••••••••••' : 'sk-...'}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm pr-10"
            />
            <button
              onClick={() => toggleShow('openai')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Anthropic */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-400" />
              <label className="text-sm font-medium text-white">Anthropic</label>
              {settings.anthropicKey && !anthropicKey && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </div>
          </div>
          <div className="relative">
            <Input
              type={showKeys.anthropic ? 'text' : 'password'}
              placeholder={settings.anthropicKey ? '••••••••••••••••' : 'sk-ant-...'}
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm pr-10"
            />
            <button
              onClick={() => toggleShow('anthropic')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Google */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <label className="text-sm font-medium text-white">Google AI</label>
              {settings.googleKey && !googleKey && (
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Configured</span>
              )}
            </div>
          </div>
          <div className="relative">
            <Input
              type={showKeys.google ? 'text' : 'password'}
              placeholder={settings.googleKey ? '••••••••••••••••' : 'AIza...'}
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              className="bg-neutral-900/50 border-white/10 text-white font-mono text-sm pr-10"
            />
            <button
              onClick={() => toggleShow('google')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showKeys.google ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        {/* Ollama */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <label className="text-sm font-medium text-white">Ollama (Local)</label>
            {settings.ollamaUrl && (
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Configured</span>
            )}
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

      {/* Save */}
      <div className="mt-6 flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Keys'}
          {saved ? <CheckCircle2 className="w-4 h-4 ml-2" /> : <Save className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
