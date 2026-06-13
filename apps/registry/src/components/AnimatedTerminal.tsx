'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnimatedTerminal() {
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);

  // Total steps: 0 to 6
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const fullText = `$ skillspace install @skillspace/security-review\n$ skillspace run security-review --input ./src`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full h-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl flex flex-col text-left">
      <div className="flex h-12 items-center justify-between border-b border-white/10 bg-neutral-950 px-4 shrink-0">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
          <div className="h-3 w-3 rounded-full bg-neutral-700" />
        </div>
        <div className="text-xs font-mono text-neutral-500">bash</div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:bg-white/10 hover:text-white" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 p-6 font-mono text-sm sm:text-base overflow-y-auto">
        <div className="flex flex-col gap-1 text-neutral-300">
          
          {/* Step 0: Type first command */}
          <div className="flex gap-3">
            <span className="text-cyan-400">$</span>
            <span>skillspace install @skillspace/security-review</span>
          </div>

          {/* Step 1: Output 1 */}
          {step >= 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col text-neutral-400 ml-5 mb-4">
              <span className="text-green-400">✓ <span className="text-neutral-400">Resolved @core/summary@1.2.0</span></span>
              <span className="text-green-400">✓ <span className="text-neutral-400">Downloaded (12 KB)</span></span>
              <span className="text-green-400">✓ <span className="text-neutral-400">Ready</span></span>
            </motion.div>
          )}

          {/* Step 2: Type second command */}
          {step >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <span className="text-cyan-400">$</span>
              <span>skillspace run @core/summary --text "The quarterly report shows..."</span>
            </motion.div>
          )}

          {/* Step 3: Loading */}
          {step >= 3 && step < 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-5 text-yellow-400/80 mb-4">
              ⠸ Running @core/summary@1.2.0...
            </motion.div>
          )}

          {/* Step 4: Output */}
          {step >= 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-5 flex flex-col text-neutral-400 mt-2">
              <span className="text-neutral-500 mb-1">Output:</span>
              <span className="text-white">{"{"}</span>
              <span className="ml-4"><span className="text-cyan-300">"summary"</span>: <span className="text-green-300">"Q3 revenue grew 14% YoY..."</span>,</span>
              <span className="ml-4"><span className="text-cyan-300">"tokens_used"</span>: <span className="text-yellow-300">312</span></span>
              <span className="text-white">{"}"}</span>
            </motion.div>
          )}

          {/* Cursor */}
          {step >= 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mt-4">
              <span className="text-cyan-400">$</span>
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="h-5 w-2 bg-neutral-400"
              />
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
