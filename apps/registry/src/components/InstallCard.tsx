'use client';

import { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export default function InstallCard({ pkgName, children }: { pkgName: string, children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const command = `skillspace install ${pkgName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-white mb-3 flex items-center gap-2 text-sm font-semibold">
        <Terminal size={16} className="text-neutral-400" /> Quick Install
      </h3>
      <div className="mb-5 flex items-center justify-between rounded-lg bg-neutral-900/80 border border-white/5 px-4 py-2.5">
        <code className="text-sm font-mono text-neutral-200">{command}</code>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 transition-colors ${
            copied ? 'text-green-400' : 'text-neutral-500 hover:text-neutral-300'
          }`}
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied && <span className="text-[10px]">Copied!</span>}
        </button>
      </div>
      {children}
    </div>
  );
}
