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
    <div className="card">
      <h3 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Terminal size={18} color="var(--accent)" /> Quick Install
      </h3>
      <div className="codeBlock" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <code>{command}</code>
        <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Copy to clipboard">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied && <span style={{ fontSize: '10px' }}>Copied!</span>}
        </button>
      </div>
      {children}
    </div>
  );
}
