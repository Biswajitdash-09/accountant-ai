import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { Settings, RefreshCw, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const HMRCSettings = () => {
  const { connection, isConnected } = useHMRCConnection();
  const { toast } = useToast();
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState<string>("daily");

  const handleAutoSyncChange = (checked: boolean) => {
    setAutoSync(checked);
    toast({
      title: checked ? "Auto-sync enabled" : "Auto-sync disabled",
      description: checked 
        ? "HMRC data will sync automatically" 
        : "You'll need to manually sync HMRC data",
    });
  };

  const handleFrequencyChange = (value: string) => {
    setSyncFrequency(value);
    toast({
      title: "Sync frequency updated",
      description: `HMRC data will sync ${value}`,
    });
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            HMRC Settings
          </CardTitle>
          <CardDescription>Configure your HMRC integration preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Connect your HMRC account to access settings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          HMRC Settings
        </CardTitle>
        <CardDescription>Configure your HMRC integration preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Sync */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <Label htmlFor="auto-sync">Automatic Sync</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically sync HMRC data at regular intervals
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSync}
            onCheckedChange={handleAutoSyncChange}
          />
        </div>

        {/* Sync Frequency */}
        {autoSync && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              <Label htmlFor="sync-frequency">Sync Frequency</Label>
            </div>
            <Select value={syncFrequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Data will be automatically fetched from HMRC {syncFrequency}
            </p>
          </div>
        )}

        {/* Connection Info */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Connection Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">Active</span>
            </div>
            {connection?.scopes && connection.scopes.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Permissions:</span>
                <span className="font-medium">{connection.scopes.length} scope(s)</span>
              </div>
            )}
            {connection?.connected_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connected:</span>
                <span className="font-medium">
                  {new Date(connection.connected_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Data Retention */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Data Management</h4>
          <p className="text-sm text-muted-foreground mb-3">
            HMRC data is stored securely and automatically updated when syncing
          </p>
          <Button variant="outline" size="sm">
            Clear Cached Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
