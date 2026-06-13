'use client';

import { Clock, CheckCircle2, XCircle, Cpu, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Execution {
  id: string;
  package: { name: string; type: string };
  modelId: string;
  durationMs: number;
  tokensUsed: number;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function ActivityFeedClient({ executions }: { executions: Execution[] }) {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-neutral-400 mt-1">Recent skill execution sessions from your CLI.</p>
      </div>

      {executions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <Clock className="w-10 h-10 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No activity yet</h3>
          <p className="text-sm text-neutral-400 mb-4 max-w-sm mx-auto">
            Run skills via the CLI to see execution activity here. Link your project with <code className="text-cyan-400 text-xs bg-white/5 px-1.5 py-0.5 rounded">skillspace link</code> for session tracking.
          </p>
          <a
            href="/dashboard/playground"
            className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300"
          >
            Try the playground instead <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {executions.map((exec) => (
            <div
              key={exec.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              {/* Status icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                exec.status === 'success'
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {exec.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/packages/${exec.package.name}`}
                    className="text-sm font-medium text-white font-mono truncate hover:underline"
                  >
                    {exec.package.name}
                  </Link>
                  <span className="text-[10px] text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded">
                    {exec.package.type}
                  </span>
                </div>
                {exec.errorMessage && (
                  <p className="text-xs text-red-400 mt-1 truncate">{exec.errorMessage}</p>
                )}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 flex-shrink-0 text-xs text-neutral-500">
                <div className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" />
                  <span className="font-mono">{exec.modelId.split('/').pop()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>{formatDuration(exec.durationMs)}</span>
                </div>
                {exec.tokensUsed > 0 && (
                  <span>{exec.tokensUsed.toLocaleString()} tokens</span>
                )}
                <span className="text-neutral-600">{timeAgo(exec.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
