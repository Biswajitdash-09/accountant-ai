import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, TrendingUp, DollarSign, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageLog {
  id: string;
  feature: string;
  model: string;
  tokens_used: number;
  cost_estimate: number;
  created_at: string;
}

export const AIUsageDashboard = () => {
  const { data: usageLogs, isLoading } = useQuery({
    queryKey: ['ai-usage-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as UsageLog[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const stats = usageLogs?.reduce(
    (acc, log) => ({
      totalRequests: acc.totalRequests + 1,
      totalTokens: acc.totalTokens + log.tokens_used,
      totalCost: acc.totalCost + (log.cost_estimate || 0),
      byFeature: {
        ...acc.byFeature,
        [log.feature]: (acc.byFeature[log.feature] || 0) + 1
      }
    }),
    {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byFeature: {} as Record<string, number>
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          AI Usage Analytics
        </CardTitle>
        <CardDescription>
          Track your AI feature usage and costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{stats?.totalRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Used</p>
                  <p className="text-2xl font-bold">
                    {stats?.totalTokens.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-2xl font-bold">
                    ${stats?.totalCost.toFixed(4) || '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage by Feature */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Usage by Feature</h3>
          <div className="space-y-2">
            {Object.entries(stats?.byFeature || {}).map(([feature, count]) => (
              <div key={feature} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium capitalize">{feature.replace('_', ' ')}</span>
                <Badge variant="secondary">{count} requests</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Recent Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {usageLogs?.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 text-xs border rounded">
                <div className="space-y-1">
                  <p className="font-medium">{log.feature}</p>
                  <p className="text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{log.tokens_used} tokens</p>
                  <p className="text-muted-foreground">{log.model}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};