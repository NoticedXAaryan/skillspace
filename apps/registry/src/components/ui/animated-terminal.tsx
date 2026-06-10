"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Copy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AnimatedTerminal = ({
  command,
  output,
  className,
}: {
  command: string;
  output?: string;
  className?: string;
}) => {
  const [displayedCommand, setDisplayedCommand] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let i = 0;
    setShowOutput(false);
    setDisplayedCommand("");
    
    const interval = setInterval(() => {
      if (i <= command.length) {
        setDisplayedCommand(command.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowOutput(true), 400);
      }
    }, 50); // Typing speed

    return () => clearInterval(interval);
  }, [command]);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("w-full max-w-2xl rounded-xl border border-neutral-800 bg-black/80 backdrop-blur-md overflow-hidden shadow-2xl", className)}>
      {/* Mac OS Window Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <Terminal className="w-3 h-3" /> bash
        </div>
        <button 
          onClick={handleCopy}
          className="text-neutral-500 hover:text-white transition-colors"
          title="Copy command"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-4 font-mono text-sm">
        <div className="flex items-start gap-3 text-neutral-300">
          <span className="text-amber-500 font-bold shrink-0">$</span>
          <span className="break-all">
            {displayedCommand}
            {!showOutput && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-amber-500 ml-1 align-middle"
              />
            )}
          </span>
        </div>
        {showOutput && output && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-neutral-500 whitespace-pre-wrap pl-5"
          >
            {output}
          </motion.div>
        )}
        {showOutput && !output && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-start gap-3 text-neutral-300"
          >
            <span className="text-amber-500 font-bold shrink-0">$</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-amber-500 ml-1 align-middle"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};
