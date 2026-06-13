'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface TypeData extends ChartData {
  color: string;
}

export function ExecutionBarChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="mt-4 h-[250px] w-full flex items-center justify-center text-muted-foreground text-sm">
        No execution data yet. Run some skills to see analytics.
      </div>
    );
  }

  return (
    <div className="mt-4 h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`} />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TypePieChart({ data }: { data: TypeData[] }) {
  if (data.length === 0) {
    return (
      <div className="mt-4 flex h-[250px] w-full items-center justify-center text-muted-foreground text-sm">
        No packages published yet.
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="mt-4 flex h-[250px] w-full items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
            itemStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value) => [`${Math.round((Number(value) / total) * 100)}% (${value})`, 'Count']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
