'use client';

import { useState } from 'react';
import { Check, Copy, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CodeBlockClientProps {
  html: string;
  rawCode: string;
  language: string;
  hasOutput?: boolean;
}

export default function CodeBlockClient({ html, rawCode, language, hasOutput }: CodeBlockClientProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [simulatedOutput, setSimulatedOutput] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    setSimulatedOutput('Running capability...');
    setTimeout(() => {
      setSimulatedOutput('> Successfully executed.\n> Output: Simulated response from LLM.');
    }, 1000);
  };

  return (
    <div className="relative my-6 overflow-hidden rounded-lg border bg-zinc-950 shadow-sm">
      <div className="flex h-10 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4">
        <span className="text-xs font-medium text-zinc-400">{language}</span>
        <div className="flex items-center gap-2">
          {language === 'bash' && rawCode.includes('skillspace run') && (
            <Button variant="ghost" size="icon" onClick={handleRun} className="h-6 w-6 text-zinc-400 hover:text-zinc-50">
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6 text-zinc-400 hover:text-zinc-50">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      
      <div 
        className={cn(
          "overflow-x-auto p-4 text-sm [&>pre]:!bg-transparent [&>pre]:p-0",
          !expanded && rawCode.split('\n').length > 10 ? "max-h-64" : ""
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      {rawCode.split('\n').length > 10 && (
        <div className={cn("flex justify-center border-t border-zinc-800 bg-zinc-950 p-2", !expanded && "absolute bottom-0 w-full bg-gradient-to-t from-zinc-950 to-transparent pt-12 border-transparent")}>
          <Button variant="secondary" size="sm" className="h-7 text-xs" onClick={() => setExpanded(!expanded)}>
            {expanded ? <><ChevronUp className="mr-1 h-3 w-3"/> Collapse</> : <><ChevronDown className="mr-1 h-3 w-3"/> Expand</>}
          </Button>
        </div>
      )}

      {simulatedOutput && (
        <div className="border-t border-zinc-800 bg-black p-4 text-xs font-mono text-zinc-300">
          <div className="mb-2 text-zinc-500">Terminal Output</div>
          <pre className="whitespace-pre-wrap">{simulatedOutput}</pre>
        </div>
      )}
    </div>
  );
}
