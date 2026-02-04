import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Building2, CheckCircle2 } from 'lucide-react';
import { DemoBankConnection, formatDemoCurrency, providerInfo, bankColors } from '@/lib/demoData';
import DemoBadge from './DemoBadge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DemoBankCardProps {
  connection: DemoBankConnection;
}

const DemoBankCard = ({ connection }: DemoBankCardProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const provider = providerInfo[connection.provider];
  const bankColor = bankColors[connection.metadata.bank_name] || 'bg-gray-600';

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
    toast.success(`${connection.account_name} synced successfully`);
  };

  const lastSyncTime = connection.last_sync_at 
    ? new Date(connection.last_sync_at).toLocaleString()
    : 'Never';

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className={cn("h-1.5", bankColor)} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-lg text-white", bankColor)}>
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {connection.metadata.bank_name}
                <DemoBadge size="sm" />
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {connection.account_name}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20"
          >
            <CheckCircle2 className="h-3 w-3" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold">
            {formatDemoCurrency(connection.balance, connection.currency)}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Connected via</span>
            <Badge variant="secondary" className={cn(provider?.bgColor, provider?.color)}>
              {provider?.name || connection.provider}
            </Badge>
          </div>
          <span className="text-muted-foreground">
            {connection.metadata.region}
          </span>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Last synced: {lastSyncTime}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="min-h-[36px]"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DemoBankCard;
