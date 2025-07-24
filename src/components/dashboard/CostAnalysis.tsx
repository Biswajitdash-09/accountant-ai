
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo } from "react";
import { TrendingDown, AlertCircle, Target, DollarSign } from "lucide-react";
import MetricCard from "./MetricCard";

const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE', '#8884D8'];

const CostAnalysis = () => {
  const { transactions, isLoading } = useTransactions();

  const costAnalytics = useMemo(() => {
    if (!transactions) return null;

    const expenses = transactions.filter(t => t.type === 'expense');

    // Calculate costs by category
    const costsByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate costs by subcategory
    const costsBySubcategory = expenses.reduce((acc, expense) => {
      const subcategory = expense.subcategory || 'General';
      acc[subcategory] = (acc[subcategory] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly costs
    const monthlyCosts = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate daily average costs
    const dailyCosts = expenses.reduce((acc, expense) => {
      const date = expense.date;
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Transform data for charts
    const categoryData = Object.entries(costsByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));

    const subcategoryData = Object.entries(costsBySubcategory).map(([subcategory, amount]) => ({
      name: subcategory,
      value: amount,
    }));

    const monthlyData = Object.entries(monthlyCosts).map(([month, amount]) => ({
      month,
      costs: amount,
    }));

    // Calculate totals and averages
    const totalCosts = Object.values(costsByCategory).reduce((sum, amount) => sum + amount, 0);
    const averageDailyCost = Object.values(dailyCosts).reduce((sum, amount) => sum + amount, 0) / Object.keys(dailyCosts).length || 0;
    const averageMonthlyCost = Object.values(monthlyCosts).reduce((sum, amount) => sum + amount, 0) / Object.keys(monthlyCosts).length || 0;

    // Find highest cost category
    const highestCostCategory = Object.entries(costsByCategory).reduce((max, [category, amount]) => 
      amount > max.amount ? { category, amount } : max, { category: '', amount: 0 }
    );

    // Calculate cost trends
    const recentMonths = monthlyData.slice(-3);
    const currentMonth = recentMonths[recentMonths.length - 1]?.costs || 0;
    const previousMonth = recentMonths[recentMonths.length - 2]?.costs || 0;
    const costTrend = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

    return {
      categoryData,
      subcategoryData,
      monthlyData,
      totalCosts,
      averageDailyCost,
      averageMonthlyCost,
      highestCostCategory,
      costTrend,
      totalTransactions: expenses.length,
    };
  }, [transactions]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!costAnalytics) {
    return <div className="text-center text-muted-foreground">No cost data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Costs"
          value={`$${costAnalytics.totalCosts.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          description="All expenses combined"
        />
        <MetricCard
          title="Monthly Average"
          value={`$${costAnalytics.averageMonthlyCost.toLocaleString()}`}
          icon={<Target className="h-4 w-4" />}
          description="Average monthly spending"
        />
        <MetricCard
          title="Daily Average"
          value={`$${costAnalytics.averageDailyCost.toLocaleString()}`}
          icon={<TrendingDown className="h-4 w-4" />}
          description="Average daily spending"
        />
        <MetricCard
          title="Cost Trend"
          value={`${costAnalytics.costTrend.toFixed(1)}%`}
          icon={<AlertCircle className="h-4 w-4" />}
          trend={{
            value: Math.abs(costAnalytics.costTrend),
            positive: costAnalytics.costTrend < 0,
          }}
          description="Month-over-month change"
        />
      </div>

      {/* Cost Analysis */}
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
                <CardTitle>Cost Distribution by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costAnalytics.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costAnalytics.categoryData.map((entry, index) => (
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
                <CardTitle>Top Cost Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {costAnalytics.categoryData
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 5)
                  .map((category, index) => (
                    <div key={category.name} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-lg font-semibold">${category.value.toLocaleString()}</span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Subcategory</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={costAnalytics.subcategoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="value" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={costAnalytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Line type="monotone" dataKey="costs" stroke="#FF8042" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostAnalysis;
