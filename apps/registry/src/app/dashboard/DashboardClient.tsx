'use client';

import { useState } from 'react';
import { Settings, Package, MessageSquare, AlertCircle, TrendingUp, DollarSign, Edit3, Trash2, Star, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FloatingDock, DockItem } from '@/components/ui/floating-dock';

type PackageData = {
  id: string;
  name: string;
  version: string;
  downloads: number;
  stars: number;
  publishedAt: Date | string;
};

type DashboardData = {
  packages: PackageData[];
  user: {
    username: string;
  }
};

const DOCK_ITEMS: DockItem[] = [
  { id: 'packages', name: 'My Packages', icon: Package },
  { id: 'issues', name: 'Issues', icon: AlertCircle },
  { id: 'reviews', name: 'Reviews', icon: MessageSquare },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp },
  { id: 'bounties', name: 'Bounties', icon: DollarSign },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState('packages');

  return (
    <div className="flex min-h-[calc(100vh-48px)] bg-black relative overflow-hidden pb-32">
      {/* Background Shader / Gradient Effect */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[10%] left-[20%] -z-10 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.05)_0%,transparent_60%)]" />
        <div className="absolute top-[40%] right-[10%] -z-10 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_50%)]" />
      </div>

      {/* Floating Dock Navigation */}
      <FloatingDock 
        items={DOCK_ITEMS}
        activeItem={activeTab}
        onItemChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto p-6 md:p-16 z-10">
        <div className="mb-8 pl-4 md:pl-0 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Maintainer Portal</h2>
            <p className="text-sm text-neutral-400">@{data.user.username}</p>
          </div>
        </div>

        {activeTab === 'packages' && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <h1 className="text-3xl font-bold text-white">My Packages</h1>
              <Button className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold">Publish New</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.packages.length === 0 ? (
                <div className="col-span-full py-24 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="mb-2 text-xl text-white">No packages yet</h3>
                  <p>You haven't published any skills to the registry.</p>
                </div>
              ) : (
                data.packages.map((pkg) => (
                  <div key={pkg.id} className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-950/50 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-neutral-900/80 hover:shadow-[0_8px_32px_rgba(34,211,238,0.15)]">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
                          <Package className="w-6 h-6 text-neutral-300 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <div className="flex gap-2">
                          <button className="text-neutral-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
                          <button className="text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <h3 className="mb-1 text-xl font-semibold text-white tracking-tight">{pkg.name}</h3>
                      <p className="text-sm text-neutral-400 mb-6 font-mono">{pkg.version}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-sm text-neutral-400">
                      <span className="flex items-center gap-1.5 font-mono"><TrendingUp size={14} /> {pkg.downloads.toLocaleString()}</span>
                      <span className="flex items-center gap-1.5 font-mono"><Star size={14} className="text-cyan-400"/> {pkg.stars.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h1 className="text-3xl font-bold text-white">Open Issues</h1>
            </div>
            <div className="py-24 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="mb-2 text-xl text-white">No critical issues</h3>
              <p>Your packages are running smoothly across the ecosystem.</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h1 className="text-3xl font-bold text-white">Community Reviews</h1>
            </div>
            <div className="py-24 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="mb-2 text-xl text-white">No new reviews</h3>
                <p>Check back later for community feedback.</p>
            </div>
          </div>
        )}

        {(activeTab === 'analytics' || activeTab === 'bounties' || activeTab === 'settings') && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-white/10 pb-4">
              <h1 className="text-3xl font-bold text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            </div>
            <div className="py-24 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="mb-2 text-xl text-white">Under Construction</h3>
              <p>This maintainer feature is rolling out in the next Phase.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
