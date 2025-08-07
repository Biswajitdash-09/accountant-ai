
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle,
  Calendar, Filter, Download, Eye, BarChart3
} from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface AnalyticsData {
  period: string;
  income: number;
  expenses: number;
  profit: number;
  savings: number;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface FinancialMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  format: 'currency' | 'percentage';
}

export const AdvancedAnalytics = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedView, setSelectedView] = useState("overview");

  // Sample analytics data - in real app, this would come from your data
  const analyticsData: AnalyticsData[] = [
    { period: "Jan", income: 8500, expenses: 6200, profit: 2300, savings: 2000 },
    { period: "Feb", income: 9200, expenses: 6800, profit: 2400, savings: 2100 },
    { period: "Mar", income: 8800, expenses: 6500, profit: 2300, savings: 1900 },
    { period: "Apr", income: 9500, expenses: 7200, profit: 2300, savings: 2200 },
    { period: "May", income: 10200, expenses: 7500, profit: 2700, savings: 2400 },
    { period: "Jun", income: 9800, expenses: 7100, profit: 2700, savings: 2300 },
  ];

  const expenseCategories: CategoryBreakdown[] = [
    { name: "Housing", amount: 2500, percentage: 35, color: "#0088FE" },
    { name: "Food & Dining", amount: 800, percentage: 11, color: "#00C49F" },
    { name: "Transportation", amount: 600, percentage: 8, color: "#FFBB28" },
    { name: "Utilities", amount: 400, percentage: 6, color: "#FF8042" },
    { name: "Entertainment", amount: 300, percentage: 4, color: "#8884D8" },
    { name: "Healthcare", amount: 250, percentage: 4, color: "#82CA9D" },
    { name: "Other", amount: 2350, percentage: 32, color: "#FFC658" },
  ];

  const incomeStreams: CategoryBreakdown[] = [
    { name: "Salary", amount: 7500, percentage: 75, color: "#0088FE" },
    { name: "Freelancing", amount: 1500, percentage: 15, color: "#00C49F" },
    { name: "Investments", amount: 800, percentage: 8, color: "#FFBB28" },
    { name: "Other", amount: 200, percentage: 2, color: "#FF8042" },
  ];

  const keyMetrics: FinancialMetric[] = [
    { label: "Monthly Savings Rate", value: 24, change: 3.2, trend: 'up', format: 'percentage' },
    { label: "Expense Ratio", value: 76, change: -2.1, trend: 'up', format: 'percentage' },
    { label: "Investment Growth", value: 8.5, change: 1.3, trend: 'up', format: 'percentage' },
    { label: "Emergency Fund Ratio", value: 4.2, change: 0.8, trend: 'up', format: 'currency' },
  ];

  const cashFlowData = analyticsData.map(item => ({
    ...item,
    netFlow: item.income - item.expenses,
    cumulativeSavings: item.savings,
  }));

  const exportData = () => {
    // In real app, implement data export functionality
    console.log("Exporting analytics data...");
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Advanced Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive financial insights and performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="2years">Last 2 Years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Badge>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {metric.format === 'currency' ? 
                    `${metric.value}x` : 
                    `${metric.value}%`
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profit & Loss Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Analysis</CardTitle>
                <CardDescription>
                  Monthly income vs expenses breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  Where your money is going
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>
                Track your money in and money out over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Income Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
                <CardDescription>
                  Diversification of your income streams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {incomeStreams.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{source.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(source.amount)} ({source.percentage}%)
                      </span>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Expense Categories Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>
                  Detailed breakdown of your spending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(category.amount)} ({category.percentage}%)
                      </span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>
                Long-term patterns in your financial behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Income Trend"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Expense Trend"
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Savings Trend"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
