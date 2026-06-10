import React from 'react';
import { Badge } from '@/components/ui/badge';

export type PackageTypeVariant = 'skill' | 'v2-skill' | 'agent' | 'mcp' | 'workflow' | 'knowledge';

export interface PackageTypeProps {
  type: string;
  className?: string;
}

export function PackageTypeBadge({ type, className = '' }: PackageTypeProps) {
  let label = type.toUpperCase();
  let variantClass = 'bg-gray-100 text-gray-800 border-gray-200';

  // Determine appearance based on parsed type logic
  if (type === 'v2-skill') {
    label = 'V2 SKILL';
    variantClass = 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (type === 'skill' || type === 'v1-skill') {
    label = 'V1 SKILL';
    variantClass = 'bg-amber-100 text-amber-800 border-amber-200';
  } else if (type === 'agent') {
    variantClass = 'bg-purple-100 text-purple-800 border-purple-200';
  } else if (type === 'mcp') {
    variantClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  } else if (type === 'workflow') {
    variantClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
  }

  return (
    <Badge 
      variant="outline" 
      className={`font-mono text-[10px] tracking-wider ${variantClass} ${className}`}
    >
      {label}
    </Badge>
  );
}
