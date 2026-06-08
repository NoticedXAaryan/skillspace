'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Clock, Cpu, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/analytics?limit=100', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

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
    const pkg = log.package?.name || 'Unknown';
    if (!acc[pkg]) acc[pkg] = { name: pkg, executions: 0 };
    acc[pkg].executions += 1;
    return acc;
  }, {});
  const barData = Object.values(packageDistribution);

  const timeSeriesDataMap = logs.reduce((acc: any, log) => {
    const date = new Date(log.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = { date, executions: 0 };
    acc[date].executions += 1;
    return acc;
  }, {});
  const lineData = Object.values(timeSeriesDataMap).reverse();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>Analytics Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Monitor usage, latency, and costs.</p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Executions Over Time</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: '#fff' }} />
                <Line type="monotone" dataKey="executions" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Executions by Package</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: '#fff' }} />
                <Bar dataKey="executions" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Recent Executions</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Package</th>
                <th style={{ padding: '1rem' }}>Version</th>
                <th style={{ padding: '1rem' }}>Model</th>
                <th style={{ padding: '1rem' }}>Duration</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', color: '#fff', fontWeight: 500 }}>
                    {log.package?.name || 'Unknown'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.version}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.modelId}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{log.durationMs}ms</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="tag" style={{ color: log.status === 'success' ? 'var(--success)' : 'var(--error)', background: log.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No execution logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
