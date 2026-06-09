'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COMMANDS = [
  'skillspace search summarizer',
  'skillspace install summarizer',
  'skillspace run summarizer'
];

export default function AnimatedTerminal() {
  const [cmdIndex, setCmdIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCmdIndex((prev) => (prev + 1) % COMMANDS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(COMMANDS[cmdIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl backdrop-blur-xl">
      <div className="flex h-12 items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex min-h-[120px] items-center p-6 font-mono text-sm sm:text-base">
        <div className="flex w-full items-center gap-3 text-zinc-300">
          <Terminal className="h-5 w-5 text-primary" />
          <AnimatePresence mode="wait">
            <motion.div
              key={cmdIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {COMMANDS[cmdIndex]}
            </motion.div>
          </AnimatePresence>
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="h-5 w-2 bg-zinc-400"
          />
        </div>
      </div>
    </div>
  );
}
