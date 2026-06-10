'use client';

import { useState } from 'react';
import { Flame } from 'lucide-react';
import { LeaderboardCard, type LeaderboardRunOption } from '@/components/ui/leaderboard-card';

type PackageItem = {
  id: string;
  name: string;
  author: string;
  downloads: number;
  stars: number;
};

type TrendingData = {
  today: PackageItem[];
  week: PackageItem[];
  month: PackageItem[];
  allTime: PackageItem[];
};

export default function TrendingClient({ data }: { data: TrendingData }) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'allTime'>('today');

  const currentList = data[timeframe] || [];

  // Map package data to leaderboard rankings
  const rankings = currentList.map((item, index) => ({
    userId: item.id,
    rank: index + 1,
    userName: item.name,
    byline: `by @${item.author}`,
    value: item.downloads,
    displayed: true,
  }));

  const podiumRankings = rankings.slice(0, 3).map(r => ({
    userId: r.userId,
    userName: r.userName,
    rank: r.rank,
    value: r.value,
  }));

  const remainingRankings = rankings.slice(3); // Wait, usually the podium shows the top 3 and the list shows everything or the rest. Let's pass all to rankings list so they can see themselves, or maybe just all of them. 
  // Actually, standard leaderboards show 1-3 in podium and 4+ in the list.
  // Wait, the prompt's demo showed podium has 1-3 and rankings has 1-5. It's up to us. I will pass all to rankings so we see the full list, or maybe just 4-10. Let's pass all.

  const runOptions: LeaderboardRunOption[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'allTime', label: 'All Time' },
  ];

  const now = new Date();
  const getDates = (tf: string) => {
    const to = new Date(now);
    const from = new Date(now);
    if (tf === 'today') from.setHours(0,0,0,0);
    if (tf === 'week') from.setDate(now.getDate() - 7);
    if (tf === 'month') from.setMonth(now.getMonth() - 1);
    if (tf === 'allTime') from.setFullYear(2023, 0, 1);
    return { fromDate: from, toDate: to };
  }

  const { fromDate, toDate } = getDates(timeframe);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-black p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-3 bg-cyan-500/10 rounded-2xl mb-4 border border-cyan-500/20">
            <Flame className="w-8 h-8 text-cyan-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Trending Capabilities
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl">
            Discover the most downloaded and highest-rated AI skills in the ecosystem right now.
          </p>
        </div>

        <LeaderboardCard
          title="Registry Leaderboard"
          fromDate={fromDate}
          toDate={toDate}
          podiumRankings={podiumRankings}
          rankings={rankings}
          runOptions={runOptions}
          selectedRunId={timeframe}
          onRunChange={(id) => setTimeframe(id as any)}
        />
      </div>
    </main>
  );
}
