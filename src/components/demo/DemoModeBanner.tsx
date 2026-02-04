import React from 'react';
import { Film, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { cn } from '@/lib/utils';

interface DemoModeBannerProps {
  className?: string;
  compact?: boolean;
}

const DemoModeBanner = ({ className, compact = false }: DemoModeBannerProps) => {
  const { isDemoMode, deactivateDemoMode, isLoading, demoStats } = useDemoMode();

  if (!isDemoMode) return null;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700",
        className
      )}>
        <Film className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
          DEMO MODE
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 p-4 rounded-lg",
      "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      "border border-amber-200 dark:border-amber-800",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
          <Film className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200">
              🎬 Investor Demo Mode Active
            </h3>
          </div>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Showing simulated data: {demoStats.accountCount} accounts, {demoStats.transactionCount} transactions
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={deactivateDemoMode}
        disabled={isLoading}
        className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
      >
        <X className="h-4 w-4 mr-1" />
        End Demo
      </Button>
    </div>
  );
};

export default DemoModeBanner;
