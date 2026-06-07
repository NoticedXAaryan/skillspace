'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, Clock, Cpu, CheckCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  packageId: string;
  version: string;
  modelId: string;
  durationMs: number;
  tokensUsed: number;
  status: string;
  createdAt: string;
  package: { name: string };
}

export default function AnalyticsDashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics?limit=100')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLogs(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-xl font-medium text-slate-400 animate-pulse">Loading Analytics...</div>
      </div>
    );
  }

  // Aggregate Data
  const totalExecutions = logs.length;
  const avgDuration = totalExecutions > 0 
    ? Math.round(logs.reduce((acc, log) => acc + log.durationMs, 0) / totalExecutions) 
    : 0;
  const totalTokens = logs.reduce((acc, log) => acc + log.tokensUsed, 0);
  const successRate = totalExecutions > 0 
    ? Math.round((logs.filter(l => l.status === 'success').length / totalExecutions) * 100) 
    : 100;

  // Chart Data Preparation (Executions over time / by package)
  const packageDistribution = logs.reduce((acc: any, log) => {
    const pkg = log.packageId || 'Unknown';
    if (!acc[pkg]) acc[pkg] = { name: pkg, executions: 0 };
    acc[pkg].executions += 1;
    return acc;
  }, {});
  const barData = Object.values(packageDistribution);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Execution Analytics</h1>
        <p className="mt-2 text-sm text-slate-400">
          Monitor your organization's capability usage and model performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 overflow-hidden rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500/20 p-3 rounded-lg">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-slate-400 truncate">Total Executions</dt>
              <dd className="text-2xl font-semibold text-white">{totalExecutions}</dd>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 overflow-hidden rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500/20 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-slate-400 truncate">Avg Latency (ms)</dt>
              <dd className="text-2xl font-semibold text-white">{avgDuration}ms</dd>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 overflow-hidden rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500/20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-slate-400 truncate">Success Rate</dt>
              <dd className="text-2xl font-semibold text-white">{successRate}%</dd>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 overflow-hidden rounded-xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-500/20 p-3 rounded-lg">
              <Cpu className="h-6 w-6 text-amber-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-slate-400 truncate">Tokens Consumed</dt>
              <dd className="text-2xl font-semibold text-white">{totalTokens.toLocaleString()}</dd>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Executions by Package</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="executions" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-6">Recent Executions Log</h3>
          <div className="overflow-hidden overflow-y-auto h-72 pr-2">
            <ul className="divide-y divide-slate-700/50">
              {logs.slice(0, 50).map((log) => (
                <li key={log.id} className="py-3 flex justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{log.packageId}@{log.version}</span>
                    <span className="text-xs text-slate-500">{log.modelId}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {log.status}
                    </span>
                    <span className="text-xs text-slate-500">{log.durationMs}ms</span>
                  </div>
                </li>
              ))}
              {logs.length === 0 && (
                <li className="py-8 text-center text-slate-500 text-sm">No execution logs found.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
