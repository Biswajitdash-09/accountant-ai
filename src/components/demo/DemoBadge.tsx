import React from 'react';
import { Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DemoBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

const DemoBadge = ({ className, size = 'sm' }: DemoBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-amber-300 bg-amber-50 text-amber-700",
        "dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        size === 'sm' && "text-[10px] px-1.5 py-0.5",
        size === 'md' && "text-xs px-2 py-1",
        className
      )}
    >
      <Film className={cn(
        "mr-1",
        size === 'sm' && "h-3 w-3",
        size === 'md' && "h-3.5 w-3.5"
      )} />
      DEMO
    </Badge>
  );
};

export default DemoBadge;
