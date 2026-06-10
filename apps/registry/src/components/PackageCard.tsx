'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, Box, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PackageData {
  name: string;
  description: string;
  downloads: number;
  latestVersion?: string;
  tags: string[];
  owner?: { username: string };
  type?: string;
  isNew?: boolean;
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function PackageCard({ pkg, index = 0, compact = false }: { pkg: PackageData, index?: number, compact?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/packages/${pkg.name}`}
      className="block w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group relative flex flex-col justify-between h-full rounded-2xl border border-white/10 bg-neutral-950/50 p-6 backdrop-blur-xl transition-all duration-300",
          compact ? "p-4" : "",
          "hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-neutral-900/80 hover:shadow-[0_8px_32px_rgba(34,211,238,0.15)]"
        )}
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
              <Box className="w-5 h-5 text-neutral-400 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="flex gap-2">
              {pkg.isNew && (
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-cyan-500/10 rounded-md border border-cyan-500/20 text-cyan-400">
                  NEW
                </span>
              )}
              {pkg.type && (
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 bg-white/5 rounded-md border border-white/5 text-neutral-400 group-hover:text-white transition-colors">
                  {pkg.type}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
            {pkg.latestVersion && (
              <span className="text-xs font-mono text-neutral-500">v{pkg.latestVersion}</span>
            )}
          </div>
          
          <p className="line-clamp-2 text-sm text-neutral-400 mb-6 leading-relaxed">
            {pkg.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {pkg.tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-neutral-900 rounded-md border border-neutral-800 text-neutral-500 group-hover:border-neutral-700 transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-700/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 border border-cyan-500/20">
              {pkg.owner?.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <span className="text-xs font-medium text-neutral-400">{pkg.owner?.username || 'skillspace'}</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-500">
            <span className="flex items-center gap-1.5">
              <ArrowDownToLine className="w-3.5 h-3.5" />
              {formatDownloads(pkg.downloads)}
            </span>
            <motion.div
              animate={{ x: isHovered ? 4 : 0 }}
              className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
