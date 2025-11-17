import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const APIUsageDashboard = ({ apiKeyId }: { apiKeyId?: string }) => {
  const { data: usageLogs, isLoading } = useQuery({
    queryKey: ['api-usage', apiKeyId],
    queryFn: async () => {
      let query = supabase
        .from('api_usage_logs')
        .select('*, api_keys!inner(key_name, user_id)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (apiKeyId) {
        query = query.eq('api_key_id', apiKeyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Loading usage data...</div>;
  }

  // Calculate statistics
  const totalRequests = usageLogs?.length || 0;
  const successfulRequests = usageLogs?.filter(log => log.status_code < 400).length || 0;
  const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests * 100).toFixed(2) : '0';
  const avgResponseTime = usageLogs?.length 
    ? (usageLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / usageLogs.length).toFixed(0)
    : '0';
  const totalCredits = usageLogs?.reduce((sum, log) => sum + (log.credits_consumed || 0), 0) || 0;

  // Group by endpoint
  const endpointStats: { [key: string]: number } = {};
  usageLogs?.forEach(log => {
    const endpoint = log.endpoint.split('?')[0];
    endpointStats[endpoint] = (endpointStats[endpoint] || 0) + 1;
  });

  // Group by hour for chart
  const hourlyData: { [key: string]: number } = {};
  usageLogs?.forEach(log => {
    const hour = new Date(log.created_at).toISOString().slice(0, 13);
    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
  });

  const chartData = Object.entries(hourlyData)
    .map(([hour, count]) => ({
      time: new Date(hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      requests: count
    }))
    .slice(-24);

  const endpointChartData = Object.entries(endpointStats)
    .map(([endpoint, count]) => ({
      endpoint: endpoint.split('/').pop() || endpoint,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 100 requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(100 - parseFloat(errorRate)).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{successfulRequests} successful</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average latency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">Total consumed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requests Over Time</CardTitle>
            <CardDescription>Last 24 hours of API activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="requests" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most frequently used API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={endpointChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="endpoint" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest API requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {usageLogs?.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant={log.status_code < 400 ? "default" : "destructive"}>
                    {log.status_code}
                  </Badge>
                  <span className="text-sm font-mono">{log.method}</span>
                  <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                    {log.endpoint}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{log.response_time_ms}ms</span>
                  <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
