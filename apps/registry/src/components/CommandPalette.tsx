'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Book, User, Terminal, Copy, CheckCircle2 } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search packages, docs, or commands..." 
        value={query}
        onValueChange={setQuery}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSearchSubmit();
        }}
      />
      <CommandList>
        <CommandEmpty className="py-6 text-center text-sm">
          <p>No results found for "{query}".</p>
          <Button variant="secondary" onClick={handleSearchSubmit} className="mt-4">
            Search Registry
          </Button>
        </CommandEmpty>

        {!query && (
          <CommandGroup heading="Trending Searches">
            <CommandItem onSelect={() => { router.push('/search?q=summarize'); setOpen(false); }}>
              <Search className="mr-2 h-4 w-4 text-muted-foreground" /> summarize
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/search?q=vision'); setOpen(false); }}>
              <Search className="mr-2 h-4 w-4 text-muted-foreground" /> vision
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/search?q=agent'); setOpen(false); }}>
              <Search className="mr-2 h-4 w-4 text-muted-foreground" /> agent
            </CommandItem>
          </CommandGroup>
        )}

        {!query && (
          <CommandGroup heading="Popular Tags">
            <div className="flex flex-wrap gap-2 p-2">
              <Badge variant="secondary" className="cursor-pointer" onClick={() => { router.push('/search?q=nlp'); setOpen(false); }}>nlp</Badge>
              <Badge variant="secondary" className="cursor-pointer" onClick={() => { router.push('/search?q=computer-vision'); setOpen(false); }}>computer-vision</Badge>
              <Badge variant="secondary" className="cursor-pointer" onClick={() => { router.push('/search?q=data-processing'); setOpen(false); }}>data-processing</Badge>
              <Badge variant="secondary" className="cursor-pointer" onClick={() => { router.push('/search?q=workflow'); setOpen(false); }}>workflow</Badge>
            </div>
          </CommandGroup>
        )}

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => { router.push('/'); setOpen(false); }}>
            <Terminal className="mr-2 h-4 w-4" /> Home
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/packages'); setOpen(false); }}>
            <Package className="mr-2 h-4 w-4" /> Browse Registry
          </CommandItem>
        </CommandGroup>

        {(query.toLowerCase().includes('install') || query.toLowerCase().includes('run') || query.toLowerCase().includes('publish') || query.toLowerCase().startsWith('skillspace')) && (
          <CommandGroup heading="CLI Commands (Click to copy)">
            <CommandItem onSelect={() => handleCopyCommand('skillspace install @skillspace/agent')}>
              {copiedCmd === 'skillspace install @skillspace/agent' ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Terminal className="mr-2 h-4 w-4 text-primary" />}
              <span>skillspace install <span className="text-muted-foreground">@skillspace/agent</span></span>
              <Copy className="ml-auto h-3 w-3 opacity-50" />
            </CommandItem>
            <CommandItem onSelect={() => handleCopyCommand('skillspace run @skillspace/summary')}>
              {copiedCmd === 'skillspace run @skillspace/summary' ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Terminal className="mr-2 h-4 w-4 text-primary" />}
              <span>skillspace run <span className="text-muted-foreground">@skillspace/summary</span></span>
              <Copy className="ml-auto h-3 w-3 opacity-50" />
            </CommandItem>
            <CommandItem onSelect={() => handleCopyCommand('skillspace publish')}>
              {copiedCmd === 'skillspace publish' ? <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> : <Terminal className="mr-2 h-4 w-4 text-primary" />}
              <span>skillspace publish</span>
              <Copy className="ml-auto h-3 w-3 opacity-50" />
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading="Documentation">
          <CommandItem onSelect={() => { router.push('/docs/getting-started'); setOpen(false); }}>
            <Book className="mr-2 h-4 w-4" /> Getting Started
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/docs/concepts'); setOpen(false); }}>
            <Book className="mr-2 h-4 w-4" /> Core Concepts
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/docs/architecture'); setOpen(false); }}>
            <Book className="mr-2 h-4 w-4" /> Architecture
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/docs/cli'); setOpen(false); }}>
            <Terminal className="mr-2 h-4 w-4" /> CLI Reference
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/docs/sdk'); setOpen(false); }}>
            <Terminal className="mr-2 h-4 w-4" /> TypeScript SDK
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/docs/security'); setOpen(false); }}>
            <Book className="mr-2 h-4 w-4" /> Security & Sandbox
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/docs/agents'); setOpen(false); }}>
            <Book className="mr-2 h-4 w-4" /> Building Agents
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/docs/workflows'); setOpen(false); }}>
            <Book className="mr-2 h-4 w-4" /> Chaining Workflows
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => { router.push('/profile'); setOpen(false); }}>
            <User className="mr-2 h-4 w-4" /> My Profile
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
