'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
        if (Array.isArray(data)) setLogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', height: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Analytics...</div>
      </div>
    );
  }

  const totalExecutions = logs.length;
  const avgDuration = totalExecutions > 0 
    ? Math.round(logs.reduce((acc, log) => acc + log.durationMs, 0) / totalExecutions) 
    : 0;
  const totalTokens = logs.reduce((acc, log) => acc + log.tokensUsed, 0);
  const successRate = totalExecutions > 0 
    ? Math.round((logs.filter(l => l.status === 'success').length / totalExecutions) * 100) 
    : 100;

  const packageDistribution = logs.reduce((acc: any, log) => {
    const pkg = log.packageId || 'Unknown';
    if (!acc[pkg]) acc[pkg] = { name: pkg, executions: 0 };
    acc[pkg].executions += 1;
    return acc;
  }, {});
  const barData = Object.values(packageDistribution);

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>Execution Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor usage and performance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} color="var(--accent)" />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Executions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{totalExecutions}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Clock size={32} color="#a855f7" />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Avg Latency</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{avgDuration}ms</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle size={32} color="var(--success)" />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Success Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{successRate}%</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Cpu size={32} color="var(--warning)" />
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tokens Consumed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{totalTokens.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Executions by Package</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: '#fff' }} />
                <Bar dataKey="executions" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Recent Executions</h3>
          <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
            {logs.slice(0, 50).map((log) => (
              <li key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>{log.packageId}@{log.version}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.modelId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: log.status === 'success' ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem' }}>{log.status}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.durationMs}ms</div>
                </div>
              </li>
            ))}
            {logs.length === 0 && <li style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No execution logs.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
