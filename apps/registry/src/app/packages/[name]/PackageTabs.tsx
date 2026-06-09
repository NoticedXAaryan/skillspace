'use client';

import { useState } from 'react';
import { Star, MessageSquare, BookOpen, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function PackageTabs({ 
  readmeContent, 
  pkgName 
}: { 
  readmeContent: React.ReactNode, 
  pkgName: string 
}) {
  const [activeTab, setActiveTab] = useState<'readme' | 'reviews' | 'discussions' | 'analytics'>('readme');

  return (
    <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex border-b border-border bg-muted/50">
        <button 
          onClick={() => setActiveTab('readme')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-2 p-4 text-sm font-medium transition-colors hover:text-foreground",
            activeTab === 'readme' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <BookOpen className="h-4 w-4" /> Readme
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-2 p-4 text-sm font-medium transition-colors hover:text-foreground",
            activeTab === 'reviews' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <Star className="h-4 w-4" /> Reviews
        </button>
        <button 
          onClick={() => setActiveTab('discussions')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-2 p-4 text-sm font-medium transition-colors hover:text-foreground",
            activeTab === 'discussions' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <MessageSquare className="h-4 w-4" /> Discussions
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 border-b-2 p-4 text-sm font-medium transition-colors hover:text-foreground",
            activeTab === 'analytics' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <Activity className="h-4 w-4" /> Analytics
        </button>
      </div>

      <div className="p-8">
        {activeTab === 'readme' && (
          <div className="prose prose-invert max-w-none text-muted-foreground">
            {readmeContent}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Community Reviews</h2>
              <Button>Write a Review</Button>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-12 text-center text-muted-foreground">
              No reviews yet. Be the first to review {pkgName}!
            </div>
          </div>
        )}

        {activeTab === 'discussions' && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Discussions</h2>
              <Button>New Topic</Button>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-12 text-center text-muted-foreground">
              No active discussions. Start a thread!
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="mb-8 text-2xl font-bold text-foreground">Package Analytics</h2>
            
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Total Executions</div>
                <div className="text-3xl font-bold text-foreground">12.4K</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Growth Rate</div>
                <div className="text-3xl font-bold text-green-500">+24%</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Avg Runtime</div>
                <div className="text-3xl font-bold text-foreground">450ms</div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-6 text-base font-medium text-muted-foreground">Install Trend (Last 7 Days)</h3>
              <div className="flex h-[150px] items-end gap-1">
                {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-primary opacity-80" style={{ height: `${h}%` }} title={`${h} installs`} />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>7 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
