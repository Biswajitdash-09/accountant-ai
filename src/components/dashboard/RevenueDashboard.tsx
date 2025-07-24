
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useRevenueStreams } from "@/hooks/useRevenueStreams";
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo } from "react";
import { DollarSign, TrendingUp, Target, Calendar } from "lucide-react";
import MetricCard from "./MetricCard";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const RevenueDashboard = () => {
  const { revenueStreams, isLoading: streamsLoading } = useRevenueStreams();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  const revenueAnalytics = useMemo(() => {
    if (!revenueStreams || !transactions) return null;

    // Calculate total revenue by type
    const revenueByType = revenueStreams.reduce((acc, stream) => {
      acc[stream.stream_type] = (acc[stream.stream_type] || 0) + stream.actual_amount;
      return acc;
    }, {} as Record<string, number>);

    // Transform for pie chart
    const pieData = Object.entries(revenueByType).map(([type, amount]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: amount,
    }));

    // Calculate revenue trends by month
    const monthlyRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, transaction) => {
        const month = new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);

    const trendData = Object.entries(monthlyRevenue).map(([month, amount]) => ({
      month,
      revenue: amount,
    }));

    // Calculate totals
    const totalRevenue = Object.values(revenueByType).reduce((sum, amount) => sum + amount, 0);
    const totalTarget = revenueStreams.reduce((sum, stream) => sum + (stream.target_amount || 0), 0);
    const achievementRate = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;

    return {
      pieData,
      trendData,
      totalRevenue,
      totalTarget,
      achievementRate,
      revenueByType,
      topPerformingStream: revenueStreams.reduce((top, stream) => 
        stream.actual_amount > (top?.actual_amount || 0) ? stream : top, null
      ),
    };
  }, [revenueStreams, transactions]);

  if (streamsLoading || transactionsLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!revenueAnalytics) {
    return <div className="text-center text-muted-foreground">No revenue data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${revenueAnalytics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          description="All revenue streams combined"
        />
        <MetricCard
          title="Target Achievement"
          value={`${revenueAnalytics.achievementRate.toFixed(1)}%`}
          icon={<Target className="h-4 w-4" />}
          trend={{
            value: revenueAnalytics.achievementRate,
            positive: revenueAnalytics.achievementRate >= 80,
          }}
        />
        <MetricCard
          title="Active Streams"
          value={revenueStreams.filter(s => s.is_active).length.toString()}
          icon={<TrendingUp className="h-4 w-4" />}
          description="Revenue streams generating income"
        />
        <MetricCard
          title="Top Performer"
          value={revenueAnalytics.topPerformingStream?.stream_name || 'N/A'}
          icon={<Calendar className="h-4 w-4" />}
          description={`$${revenueAnalytics.topPerformingStream?.actual_amount.toLocaleString() || 0}`}
        />
      </div>

      {/* Revenue Analysis */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueAnalytics.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueAnalytics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Streams Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueStreams.map((stream) => {
                  const progress = stream.target_amount ? (stream.actual_amount / stream.target_amount) * 100 : 0;
                  return (
                    <div key={stream.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stream.stream_name}</span>
                          <Badge variant="outline">{stream.stream_type}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ${stream.actual_amount.toLocaleString()} / ${stream.target_amount?.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueAnalytics.pieData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueAnalytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueDashboard;
