'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, Package, Book, User, Terminal, Copy, CheckCircle2 } from 'lucide-react';
import styles from './CommandPalette.module.css';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setOpen(false);
    }
  };

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => {
      setCopiedCmd(null);
      setOpen(false);
    }, 1000);
  };

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} className={styles.dialogWrapper} label="Global Command Menu">
      <div className={styles.dialog}>
        <div className={styles.inputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <Command.Input 
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
            placeholder="Search packages, docs, or commands..." 
            className={styles.input} 
          />
        </div>
        <Command.List className={styles.list}>
          <Command.Empty className={styles.empty}>
            <p>No results found for "{query}".</p>
            <button className="btn btnSecondary" onClick={handleSearchSubmit} style={{ marginTop: '1rem' }}>
              Search Registry
            </button>
          </Command.Empty>

          {!query && (
            <Command.Group heading="Trending Searches">
              <Command.Item onSelect={() => { router.push('/search?q=summarize'); setOpen(false); }} className={styles.item}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} /> summarize
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/search?q=vision'); setOpen(false); }} className={styles.item}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} /> vision
              </Command.Item>
              <Command.Item onSelect={() => { router.push('/search?q=agent'); setOpen(false); }} className={styles.item}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} /> agent
              </Command.Item>
            </Command.Group>
          )}

          {!query && (
            <Command.Group heading="Popular Tags">
              <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', flexWrap: 'wrap' }}>
                <span className="tag" onClick={() => { router.push('/search?q=nlp'); setOpen(false); }} style={{ cursor: 'pointer' }}>nlp</span>
                <span className="tag" onClick={() => { router.push('/search?q=computer-vision'); setOpen(false); }} style={{ cursor: 'pointer' }}>computer-vision</span>
                <span className="tag" onClick={() => { router.push('/search?q=data-processing'); setOpen(false); }} style={{ cursor: 'pointer' }}>data-processing</span>
                <span className="tag" onClick={() => { router.push('/search?q=workflow'); setOpen(false); }} style={{ cursor: 'pointer' }}>workflow</span>
              </div>
            </Command.Group>
          )}

          <Command.Group heading="Navigation">
            <Command.Item onSelect={() => { router.push('/'); setOpen(false); }} className={styles.item}>
              <Terminal size={14} /> Home
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/packages'); setOpen(false); }} className={styles.item}>
              <Package size={14} /> Browse Registry
            </Command.Item>
          </Command.Group>

          {/* Dynamic CLI Bridge */}
          {(query.toLowerCase().includes('install') || query.toLowerCase().includes('run') || query.toLowerCase().includes('publish') || query.toLowerCase().startsWith('air')) && (
            <Command.Group heading="CLI Commands (Click to copy)">
              <Command.Item onSelect={() => handleCopyCommand('air install @core/agent')} className={styles.item}>
                {copiedCmd === 'air install @core/agent' ? <CheckCircle2 size={14} color="var(--success)" /> : <Terminal size={14} color="var(--accent)" />}
                <span>air install <span style={{ color: 'var(--text-secondary)' }}>@core/agent</span></span>
                <Copy size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </Command.Item>
              <Command.Item onSelect={() => handleCopyCommand('air run @core/summary')} className={styles.item}>
                {copiedCmd === 'air run @core/summary' ? <CheckCircle2 size={14} color="var(--success)" /> : <Terminal size={14} color="var(--accent)" />}
                <span>air run <span style={{ color: 'var(--text-secondary)' }}>@core/summary</span></span>
                <Copy size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </Command.Item>
              <Command.Item onSelect={() => handleCopyCommand('air publish')} className={styles.item}>
                {copiedCmd === 'air publish' ? <CheckCircle2 size={14} color="var(--success)" /> : <Terminal size={14} color="var(--accent)" />}
                <span>air publish</span>
                <Copy size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </Command.Item>
            </Command.Group>
          )}

          <Command.Group heading="Documentation">
            <Command.Item onSelect={() => { router.push('/docs/getting-started'); setOpen(false); }} className={styles.item}>
              <Book size={14} /> Getting Started
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/docs/concepts'); setOpen(false); }} className={styles.item}>
              <Book size={14} /> Core Concepts
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/docs/architecture'); setOpen(false); }} className={styles.item}>
              <Book size={14} /> Architecture
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/docs/cli'); setOpen(false); }} className={styles.item}>
              <Terminal size={14} /> CLI Reference
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/docs/sdk'); setOpen(false); }} className={styles.item}>
              <Terminal size={14} /> TypeScript SDK
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/docs/security'); setOpen(false); }} className={styles.item}>
              <Book size={14} /> Security & Sandbox
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/docs/agents'); setOpen(false); }} className={styles.item}>
              <Book size={14} /> Building Agents
            </Command.Item>
            <Command.Item onSelect={() => { router.push('/docs/workflows'); setOpen(false); }} className={styles.item}>
              <Book size={14} /> Chaining Workflows
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Account">
            <Command.Item onSelect={() => { router.push('/profile'); setOpen(false); }} className={styles.item}>
              <User size={14} /> My Profile
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
