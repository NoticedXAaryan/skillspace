'use client';

import { useState } from 'react';
import { Settings, Package, MessageSquare, AlertCircle, TrendingUp, DollarSign, Edit3, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState('packages');

  return (
    <div className="flex min-h-[calc(100vh-48px)] bg-background">
      {/* Sidebar */}
      <aside className="hidden w-[280px] flex-col border-r border-border bg-card/40 p-8 shadow-[inset_-1px_0_0_rgba(255,255,255,0.02)] backdrop-blur-xl md:flex">
        <div className="mb-8 pl-4">
          <h2 className="text-lg font-bold text-foreground">Maintainer Portal</h2>
          <p className="text-xs text-muted-foreground">@{data.user.username}</p>
        </div>
        <nav className="flex flex-col gap-2">
          <button 
            className={cn("flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground", activeTab === 'packages' ? "bg-amber-500/10 text-amber-500 shadow-[inset_2px_0_0_#f59e0b]" : "text-muted-foreground")}
            onClick={() => setActiveTab('packages')}
          >
            <Package size={18} /> My Packages <span className="ml-auto rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">{data.packages.length}</span>
          </button>
          <button 
            className={cn("flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground", activeTab === 'issues' ? "bg-amber-500/10 text-amber-500 shadow-[inset_2px_0_0_#f59e0b]" : "text-muted-foreground")}
            onClick={() => setActiveTab('issues')}
          >
            <AlertCircle size={18} /> Issues
          </button>
          <button 
            className={cn("flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground", activeTab === 'reviews' ? "bg-amber-500/10 text-amber-500 shadow-[inset_2px_0_0_#f59e0b]" : "text-muted-foreground")}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare size={18} /> Reviews
          </button>
          <button 
            className={cn("flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground", activeTab === 'analytics' ? "bg-amber-500/10 text-amber-500 shadow-[inset_2px_0_0_#f59e0b]" : "text-muted-foreground")}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp size={18} /> Analytics
          </button>
          <button 
            className={cn("flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground", activeTab === 'bounties' ? "bg-amber-500/10 text-amber-500 shadow-[inset_2px_0_0_#f59e0b]" : "text-muted-foreground")}
            onClick={() => setActiveTab('bounties')}
          >
            <DollarSign size={18} /> Bounties
          </button>
          <button 
            className={cn("flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground", activeTab === 'settings' ? "bg-amber-500/10 text-amber-500 shadow-[inset_2px_0_0_#f59e0b]" : "text-muted-foreground")}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto p-10 md:p-16">
        <div className="absolute -top-[10%] left-[20%] -z-10 h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,transparent_60%)]"></div>
        {activeTab === 'packages' && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
              <h1 className="text-3xl font-bold text-foreground">My Packages</h1>
              <Button>Publish New</Button>
            </div>
            
            <div className="flex flex-col gap-4">
              {data.packages.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="mb-2 text-xl text-foreground">No packages yet</h3>
                  <p>You haven't published any skills to the registry.</p>
                </div>
              ) : (
                data.packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-border bg-card/60 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-[0_8px_32px_rgba(245,158,11,0.1)]">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-foreground">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground">{pkg.version} • Published {new Date(pkg.publishedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2 font-mono font-medium text-foreground"><TrendingUp size={14} className="text-muted-foreground"/> {pkg.downloads.toLocaleString()}</span>
                      <span className="flex items-center gap-2 font-mono font-medium text-foreground"><Star size={14} className="text-muted-foreground"/> {pkg.stars.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" title="Edit"><Edit3 size={16} /></button>
                      <button className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground transition-colors hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-border pb-4">
              <h1 className="text-3xl font-bold text-foreground">Open Issues</h1>
            </div>
            <div className="py-12 text-center text-muted-foreground">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="mb-2 text-xl text-foreground">No critical issues</h3>
              <p>Your packages are running smoothly across the ecosystem.</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-border pb-4">
              <h1 className="text-3xl font-bold text-foreground">Community Reviews</h1>
            </div>
            <div className="py-12 text-center text-muted-foreground">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="mb-2 text-xl text-foreground">No new reviews</h3>
                <p>Check back later for community feedback.</p>
            </div>
          </div>
        )}

        {(activeTab === 'analytics' || activeTab === 'bounties' || activeTab === 'settings') && (
          <div className="relative z-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 border-b border-border pb-4">
              <h1 className="text-3xl font-bold text-foreground">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            </div>
            <div className="py-12 text-center text-muted-foreground">
              <Settings size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="mb-2 text-xl text-foreground">Under Construction</h3>
              <p>This maintainer feature is rolling out in the next Phase.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
