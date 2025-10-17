import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { useHMRCData } from "@/hooks/useHMRCData";
import { RefreshCw, Unplug, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export const HMRCConnectionManager = () => {
  const { connection, isConnected, disconnectHMRC } = useHMRCConnection();
  const { lastSync, syncData, isSyncing } = useHMRCData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>HMRC Connection</CardTitle>
            <CardDescription>
              Manage your HMRC integration
            </CardDescription>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected && (
          <>
            {connection?.metadata && (
              <div className="text-sm text-muted-foreground">
                Connected: {format(new Date(connection.created_at), 'PPp')}
              </div>
            )}

            {lastSync && (
              <div className="text-sm">
                <div className="font-medium">Last Sync</div>
                <div className="text-muted-foreground">
                  {lastSync.last_sync_at
                    ? format(new Date(lastSync.last_sync_at), 'PPp')
                    : 'Never'}
                </div>
                {lastSync.sync_status === 'failed' && (
                  <div className="text-destructive text-xs mt-1">
                    {lastSync.error_message}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => syncData.mutate()}
                disabled={isSyncing}
                variant="outline"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>

              <Button
                onClick={() => disconnectHMRC.mutate()}
                disabled={disconnectHMRC.isPending}
                variant="destructive"
              >
                <Unplug className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
