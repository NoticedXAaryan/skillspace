'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './Analytics.module.css';

const MOCK_EXECUTIONS = [
  { name: 'Jan', value: 1200 },
  { name: 'Feb', value: 3400 },
  { name: 'Mar', value: 5500 },
  { name: 'Apr', value: 8900 },
  { name: 'May', value: 14200 },
  { name: 'Jun', value: 22500 },
];

const MOCK_TYPES = [
  { name: 'Agents', value: 45, color: '#3b82f6' },
  { name: 'Workflows', value: 30, color: '#10b981' },
  { name: 'Tools', value: 15, color: '#f59e0b' },
  { name: 'Models', value: 10, color: '#8b5cf6' },
];

export function ExecutionBarChart() {
  return (
    <div style={{ width: '100%', height: 250, marginTop: '1rem' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={MOCK_EXECUTIONS}>
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
          <Tooltip 
            cursor={{ fill: 'var(--bg-elevated)' }}
            contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TypePieChart() {
  return (
    <div style={{ width: '100%', height: 250, marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={MOCK_TYPES}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {MOCK_TYPES.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            itemStyle={{ color: 'var(--text-primary)' }}
            formatter={(value) => [`${value}%`, 'Share']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
