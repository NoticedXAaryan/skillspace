"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface LeaderboardRankingItem {
  userId: string
  rank: number
  userName: string
  byline?: string
  value: number
  displayed?: boolean
  avatarUrl?: string
}

export interface LeaderboardRankingsProps extends React.HTMLAttributes<HTMLDivElement> {
  rankings: LeaderboardRankingItem[]
  currentUserId?: string
  showPagination?: boolean
  defaultPageSize?: number
}

function formatValue(value: number) {
  return value.toLocaleString()
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
}

export const LeaderboardRankings = React.forwardRef<HTMLDivElement, LeaderboardRankingsProps>(
  ({ className, rankings, currentUserId, showPagination = false, defaultPageSize = 10, ...props }, ref) => {
    const [page, setPage] = React.useState(1)
    const totalPages = Math.ceil(rankings.length / defaultPageSize)
    
    const paginatedRankings = showPagination 
      ? rankings.slice((page - 1) * defaultPageSize, page * defaultPageSize)
      : rankings

    return (
      <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        {paginatedRankings.map((ranking) => {
          const isCurrentUser = ranking.userId === currentUserId
          return (
            <div
              key={ranking.userId}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors",
                isCurrentUser 
                  ? "bg-amber-500/10 border-amber-500/30" 
                  : "bg-background/50 border-border hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "w-6 text-center font-mono font-bold text-sm",
                  ranking.rank <= 3 ? "text-amber-500" : "text-muted-foreground"
                )}>
                  {ranking.rank}
                </span>
                
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isCurrentUser ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                )}>
                  {ranking.avatarUrl ? (
                    <img src={ranking.avatarUrl} alt={ranking.userName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(ranking.userName)
                  )}
                </div>

                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium text-sm",
                    isCurrentUser ? "text-amber-500 font-bold" : "text-foreground"
                  )}>
                    {ranking.userName}
                  </span>
                  {ranking.byline && (
                    <span className="text-xs text-muted-foreground">{ranking.byline}</span>
                  )}
                </div>
              </div>

              <div className="text-sm font-bold font-mono">
                {formatValue(ranking.value)}
              </div>
            </div>
          )
        })}

        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * defaultPageSize + 1} to {Math.min(page * defaultPageSize, rankings.length)} of {rankings.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-md border border-border bg-background disabled:opacity-50 hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded-md border border-border bg-background disabled:opacity-50 hover:bg-muted"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

LeaderboardRankings.displayName = "LeaderboardRankings"
