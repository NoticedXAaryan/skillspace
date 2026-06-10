"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Trophy, Medal, Award } from "lucide-react"

export interface LeaderboardRanking {
  userId: string
  userName: string
  rank: number
  value: number
  avatarUrl?: string
}

export interface LeaderboardPodiumProps extends React.HTMLAttributes<HTMLDivElement> {
  rankings: LeaderboardRanking[]
}

function formatValue(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
  return String(value)
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
}

export const LeaderboardPodium = React.forwardRef<HTMLDivElement, LeaderboardPodiumProps>(
  ({ className, rankings, ...props }, ref) => {
    // Expected rankings are [1, 2, 3] generally. We need to order them [2, 1, 3] for a podium.
    const first = rankings.find(r => r.rank === 1)
    const second = rankings.find(r => r.rank === 2)
    const third = rankings.find(r => r.rank === 3)

    return (
      <div
        ref={ref}
        className={cn("flex items-end justify-center gap-2 sm:gap-4 h-64 mt-8", className)}
        {...props}
      >
        {/* Rank 2 */}
        {second && (
          <div className="flex flex-col items-center flex-1 max-w-[120px] animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center mb-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-sm font-bold text-slate-300">
                  {second.avatarUrl ? <img src={second.avatarUrl} alt={second.userName} className="w-full h-full rounded-full object-cover" /> : getInitials(second.userName)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-800 rounded-full p-1 border border-slate-600">
                  <Medal className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <span className="text-xs font-medium text-center mt-3 text-muted-foreground truncate w-full px-1">{second.userName}</span>
              <span className="text-xs font-bold text-foreground">{formatValue(second.value)}</span>
            </div>
            <div className="w-full bg-slate-900 border border-slate-800 rounded-t-lg h-24 flex items-start justify-center pt-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 to-transparent" />
              <span className="text-2xl font-bold text-slate-500 opacity-50">2</span>
            </div>
          </div>
        )}

        {/* Rank 1 */}
        {first && (
          <div className="flex flex-col items-center flex-1 max-w-[140px] animate-in slide-in-from-bottom-12 duration-1000">
            <div className="flex flex-col items-center mb-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-amber-950 border-2 border-amber-500 flex items-center justify-center text-lg font-bold text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                  {first.avatarUrl ? <img src={first.avatarUrl} alt={first.userName} className="w-full h-full rounded-full object-cover" /> : getInitials(first.userName)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-amber-950 rounded-full p-1 border border-amber-500">
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <span className="text-sm font-bold text-center mt-3 text-amber-500 truncate w-full px-1">{first.userName}</span>
              <span className="text-sm font-extrabold text-foreground">{formatValue(first.value)}</span>
            </div>
            <div className="w-full bg-amber-950/20 border border-amber-900/50 rounded-t-lg h-32 flex items-start justify-center pt-2 relative overflow-hidden shadow-[inset_0_4px_20px_rgba(245,158,11,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent" />
              <span className="text-4xl font-black text-amber-500 opacity-30">1</span>
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {third && (
          <div className="flex flex-col items-center flex-1 max-w-[120px] animate-in slide-in-from-bottom-6 duration-500">
            <div className="flex flex-col items-center mb-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-orange-950 border-2 border-orange-700 flex items-center justify-center text-sm font-bold text-orange-400">
                  {third.avatarUrl ? <img src={third.avatarUrl} alt={third.userName} className="w-full h-full rounded-full object-cover" /> : getInitials(third.userName)}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-orange-950 rounded-full p-1 border border-orange-800">
                  <Award className="w-3 h-3 text-orange-600" />
                </div>
              </div>
              <span className="text-xs font-medium text-center mt-3 text-muted-foreground truncate w-full px-1">{third.userName}</span>
              <span className="text-xs font-bold text-foreground">{formatValue(third.value)}</span>
            </div>
            <div className="w-full bg-orange-950/20 border border-orange-900/40 rounded-t-lg h-20 flex items-start justify-center pt-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-800/20 to-transparent" />
              <span className="text-2xl font-bold text-orange-700 opacity-40">3</span>
            </div>
          </div>
        )}
      </div>
    )
  }
)

LeaderboardPodium.displayName = "LeaderboardPodium"
