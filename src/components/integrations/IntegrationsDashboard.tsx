import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle2, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { useCryptoWallets } from "@/hooks/useCryptoWallets";
import { formatDistanceToNow } from "date-fns";

export const IntegrationsDashboard = () => {
  const { isConnected: hmrcConnected } = useHMRCConnection();
  const { wallets } = useCryptoWallets();

  const integrations = [
    {
      name: "HMRC",
      status: hmrcConnected ? "connected" : "disconnected",
      lastSync: hmrcConnected ? new Date() : null,
      dataSource: "Tax data",
      accounts: hmrcConnected ? 1 : 0,
    },
    {
      name: "Crypto Wallets",
      status: wallets.length > 0 ? "connected" : "disconnected",
      lastSync: wallets.length > 0 ? new Date() : null,
      dataSource: "Blockchain data",
      accounts: wallets.length,
    },
    {
      name: "Bank Accounts",
      status: "pending",
      lastSync: null,
      dataSource: "Transaction data",
      accounts: 0,
    },
    {
      name: "Investment Accounts",
      status: "disconnected",
      lastSync: null,
      dataSource: "Portfolio data",
      accounts: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const connectedCount = integrations.filter(i => i.status === "connected").length;
  const totalIntegrations = integrations.length;
  const coveragePercentage = (connectedCount / totalIntegrations) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Data Sources Overview</span>
            <Badge variant="secondary">
              {connectedCount}/{totalIntegrations} Connected
            </Badge>
          </CardTitle>
          <CardDescription>
            Track your connected financial data sources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Financial Data Coverage</span>
              <span className="font-medium">{Math.round(coveragePercentage)}%</span>
            </div>
            <Progress value={coveragePercentage} className="h-2" />
          </div>

          <div className="grid gap-4 pt-2">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Total Accounts Connected</p>
                <p className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + i.accounts, 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(integration.status)}
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {integration.dataSource}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={integration.status === "connected" ? "default" : "secondary"}
                >
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accounts:</span>
                <span className="font-medium">{integration.accounts}</span>
              </div>

              {integration.lastSync && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Synced:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(integration.lastSync, { addSuffix: true })}
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {integration.status === "connected" && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <RefreshCw className="h-3 w-3 mr-2" />
                    Sync Now
                  </Button>
                )}
                {integration.status !== "connected" && (
                  <Button size="sm" className="flex-1">
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
