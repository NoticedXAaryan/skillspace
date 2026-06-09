import Link from 'next/link';
import { ArrowDownToLine } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PackageData {
  name: string;
  description: string;
  downloads: number;
  latestVersion?: string;
  tags: string[];
  owner?: { username: string };
  type?: string;
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function PackageCard({ pkg, index = 0, compact = false }: { pkg: PackageData, index?: number, compact?: boolean }) {
  return (
    <Link
      href={`/packages/${pkg.name}`}
      className="block animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Card className={cn("h-full transition-all hover:border-primary/50 hover:bg-muted/30", compact ? "p-4" : "")}>
        <CardHeader className={cn(compact ? "p-0 pb-2" : "")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-bold tracking-tight">{pkg.name}</CardTitle>
              {pkg.latestVersion && (
                <Badge variant="secondary" className="font-mono text-xs font-normal">v{pkg.latestVersion}</Badge>
              )}
            </div>
            {pkg.type && <Badge variant="outline" className="capitalize">{pkg.type}</Badge>}
          </div>
        </CardHeader>
        
        <CardContent className={cn(compact ? "p-0 pb-4" : "")}>
          <p className="line-clamp-2 text-sm text-muted-foreground">{pkg.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pkg.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="font-mono text-[10px] font-normal">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className={cn("flex items-center justify-between text-sm text-muted-foreground", compact ? "p-0" : "")}>
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {pkg.owner?.username?.[0]?.toUpperCase() || 'S'}
            </div>
            <span>{pkg.owner?.username || 'skillspace'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowDownToLine className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{formatDownloads(pkg.downloads)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
