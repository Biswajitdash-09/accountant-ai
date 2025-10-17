import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHMRCData } from "@/hooks/useHMRCData";
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export const HMRCSyncStatus = () => {
  const { syncHistory, isLoading } = useHMRCData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sync History</CardTitle>
        <CardDescription>Recent HMRC data synchronization activity</CardDescription>
      </CardHeader>
      <CardContent>
        {!syncHistory || syncHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sync history available</p>
            <p className="text-sm">Sync data to see history</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {syncHistory.map((sync) => (
              <div key={sync.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="mt-1">{getStatusIcon(sync.sync_status)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize">
                      {sync.data_type.replace('_', ' ')}
                    </span>
                    {getStatusBadge(sync.sync_status)}
                  </div>
                  
                  {sync.records_synced !== null && sync.records_synced !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      {sync.records_synced} record{sync.records_synced !== 1 ? 's' : ''} synced
                    </p>
                  )}
                  
                  {sync.error_message && (
                    <p className="text-sm text-destructive">{sync.error_message}</p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {sync.last_sync_at ? (
                      <>
                        {format(new Date(sync.last_sync_at), 'PPp')}
                        {' · '}
                        {formatDistanceToNow(new Date(sync.last_sync_at), { addSuffix: true })}
                      </>
                    ) : (
                      `Created ${formatDistanceToNow(new Date(sync.created_at), { addSuffix: true })}`
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
