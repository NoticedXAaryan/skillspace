'use client';

import { motion } from 'framer-motion';
import { Database, Server, Terminal, Box, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArchitectureDiagramProps {
  type: 'full' | 'runtime' | 'workflow';
}

const Node = ({ icon: Icon, label, className }: { icon: any, label: string, className?: string }) => (
  <div className={cn("flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm font-medium shadow-sm backdrop-blur-sm transition-colors hover:border-zinc-700", className)}>
    <Icon className="h-8 w-8 text-zinc-400" />
    <span className="text-zinc-300">{label}</span>
  </div>
);

const Connector = ({ horizontal = true }: { horizontal?: boolean }) => (
  <div className={cn("relative overflow-hidden bg-zinc-800/50", horizontal ? "h-0.5 w-16" : "h-16 w-0.5")}>
    <motion.div 
      className={cn("absolute bg-primary", horizontal ? "inset-y-0 h-full w-1/2" : "inset-x-0 h-1/2 w-full")}
      animate={horizontal ? { x: ['-100%', '200%'] } : { y: ['-100%', '200%'] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
    />
  </div>
);

export default function ArchitectureDiagram({ type }: ArchitectureDiagramProps) {
  if (type === 'runtime') {
    return (
      <div className="flex w-full items-center justify-center py-12">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Node icon={Box} label="Sandbox Environment" />
          <Connector horizontal={false} />
          <Node icon={Cog} label="Execution Engine" className="border-primary/50 [&>svg]:text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center overflow-x-auto py-12">
      <motion.div 
        className="flex min-w-max items-center px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Node icon={Terminal} label="Developer CLI" />
        <Connector />
        <Node icon={Server} label="Global Registry" className="border-primary/50 [&>svg]:text-primary" />
        <Connector />
        <Node icon={Database} label="Neon Postgres" />
      </motion.div>
    </div>
  );
}
