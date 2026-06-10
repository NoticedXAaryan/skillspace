'use client';

import { useState } from 'react';
import { Settings, Shield, Key, Package, Cpu, Plug, Activity, LayoutDashboard, Edit3, Trash2, Star, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingDock, DockItem } from '@/components/ui/floating-dock';
import { useRouter } from 'next/navigation';

type EntityData = {
  id: string;
  name: string;
  version: string;
  type: 'skill' | 'agent' | 'mcp';
  downloads: number;
  stars: number;
};

type DashboardData = {
  entities: EntityData[];
  user: {
    name: string;
    email: string;
    storageUsed: number;
    storageQuota: number;
  }
};

const DOCK_ITEMS: DockItem[] = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  { id: 'skills', name: 'My Skills', icon: Package },
  { id: 'agents', name: 'My Agents', icon: Cpu },
  { id: 'mcps', name: 'My MCPs', icon: Plug },
  { id: 'keys', name: 'API Keys', icon: Key },
  { id: 'security', name: 'Security', icon: Shield },
];

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const renderEntities = (type: string) => {
    const filtered = data.entities.filter(e => e.type === type);
    if (filtered.length === 0) {
      return (
        <div className="col-span-full py-16 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl bg-black/20">
          <Activity size={32} className="mx-auto mb-4 opacity-50" />
          <h3 className="mb-2 text-lg text-white">No {type}s published</h3>
          <p className="text-sm">Use the AIR CLI to publish your first {type}.</p>
        </div>
      );
    }
    return filtered.map((entity) => (
      <div key={entity.id} className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-neutral-950/50 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-neutral-900/80 hover:shadow-[0_8px_32px_rgba(34,211,238,0.15)]">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-colors">
              {type === 'skill' ? <Package className="w-5 h-5 text-cyan-400" /> : type === 'agent' ? <Cpu className="w-5 h-5 text-purple-400" /> : <Plug className="w-5 h-5 text-orange-400" />}
            </div>
            <div className="flex gap-2">
              <button className="text-neutral-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
              <button className="text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-white tracking-tight">{entity.name}</h3>
          <p className="text-xs text-neutral-400 mb-6 font-mono">v{entity.version}</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5 font-mono"><Activity size={14} /> {entity.downloads.toLocaleString()}</span>
          <span className="flex items-center gap-1.5 font-mono"><Star size={14} className="text-cyan-400"/> {entity.stars.toLocaleString()}</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex min-h-[calc(100vh-48px)] bg-black relative overflow-hidden pb-32">
      {/* Background Shader */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[10%] left-[20%] -z-10 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(34,211,238,0.05)_0%,transparent_60%)]" />
        <div className="absolute top-[40%] right-[10%] -z-10 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(34,211,238,0.03)_0%,transparent_50%)]" />
      </div>

      <FloatingDock items={DOCK_ITEMS} activeItem={activeTab} onItemChange={setActiveTab} />

      <main className="relative flex-1 overflow-y-auto p-6 md:p-12 z-10 max-w-6xl mx-auto w-full">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AIR Developer Console</h1>
            <p className="text-neutral-400 mt-1">Welcome back, <span className="text-cyan-400">{data.user.name}</span></p>
          </div>
          <Button className="bg-cyan-500 text-black hover:bg-cyan-400 font-semibold shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            AIR CLI Init
          </Button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-neutral-400 text-sm font-medium mb-2 uppercase tracking-wider">Total Downloads</h3>
                <p className="text-4xl font-bold text-white tracking-tight">
                  {data.entities.reduce((acc, curr) => acc + curr.downloads, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-neutral-400 text-sm font-medium mb-2 uppercase tracking-wider">Active Entities</h3>
                <p className="text-4xl font-bold text-white tracking-tight">{data.entities.length}</p>
              </div>
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <h3 className="text-neutral-400 text-sm font-medium mb-2 uppercase tracking-wider">Storage Used</h3>
                <p className="text-2xl font-bold text-purple-400 tracking-tight">
                  {(data.user.storageUsed / (1024 * 1024)).toFixed(2)} MB 
                  <span className="text-sm text-neutral-500 ml-1">/ {(data.user.storageQuota / (1024 * 1024)).toFixed(0)} MB</span>
                </p>
                <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="bg-purple-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (data.user.storageUsed / data.user.storageQuota) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="rounded-xl border border-white/10 bg-neutral-950/50 backdrop-blur-md p-8 text-center text-neutral-500">
                Activity feed will appear here as your entities are used across the network.
              </div>
            </div>
          </div>
        )}

        {['skills', 'agents', 'mcps'].includes(activeTab) && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 capitalize">{activeTab}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderEntities(activeTab.slice(0, -1))}
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-2">API Keys</h2>
            <p className="text-neutral-400 mb-8">Manage keys used to authenticate your CLI and remote Agents.</p>
            
            <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-medium text-white">Default CLI Key</h3>
                  <p className="text-sm text-neutral-500 font-mono mt-1">air_live_••••••••••••••••</p>
                </div>
                <Button variant="outline" className="border-white/10 hover:bg-white/5">Regenerate</Button>
              </div>
              <Button className="w-full bg-white text-black hover:bg-neutral-200">Create New Key</Button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-2">Security</h2>
            <p className="text-neutral-400 mb-8">Manage two-factor authentication and connected accounts.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-950/50 p-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-full text-cyan-400">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-neutral-500">Protect your publisher account.</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => router.push('/profile/2fa')} className="border-white/10 hover:bg-white/5">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-neutral-950/50 p-6 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">GitHub Account</h3>
                    <p className="text-sm text-neutral-500">Connected to {data.user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">Disconnect</Button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
