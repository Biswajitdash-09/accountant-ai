import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { usePWA } from '@/hooks/usePWA';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileSyncStatus = () => {
  const { queueCount, isSyncing, syncQueue } = useOfflineStorage();
  const { isOnline } = usePWA();
  const isMobile = useIsMobile();

  if (!isMobile || queueCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-30">
      <div className="bg-card border rounded-lg shadow-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Cloud className="h-5 w-5 text-green-500" />
          ) : (
            <CloudOff className="h-5 w-5 text-orange-500" />
          )}
          <div>
            <p className="text-sm font-medium">
              {queueCount} pending change{queueCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOnline ? 'Ready to sync' : 'Will sync when online'}
            </p>
          </div>
        </div>
        {isOnline && (
          <Button
            size="sm"
            variant="outline"
            onClick={syncQueue}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
};
