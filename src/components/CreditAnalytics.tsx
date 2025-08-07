import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCredits } from "@/hooks/useCredits";
import { usePayments } from "@/hooks/usePayments";
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  Settings,
  BarChart3,
  PieChart,
  DollarSign,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface UsageAnalytics {
  dailyUsage: Array<{ date: string; credits: number }>;
  weeklyTrend: number;
  monthlyTotal: number;
  averageDaily: number;
  peakUsage: number;
  efficiency: number;
}

const CreditAnalytics = () => {
  const { credits, availableCredits } = useCredits();
  const { payments, totalCreditspurchased } = usePayments();
  const [timeRange, setTimeRange] = useState("30d");

  // Mock analytics data - in real app, this would come from backend
  const analytics: UsageAnalytics = {
    dailyUsage: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      credits: Math.floor(Math.random() * 50) + 10
    })),
    weeklyTrend: 15.3,
    monthlyTotal: 840,
    averageDaily: 28,
    peakUsage: 75,
    efficiency: 87
  };

  const utilizationRate = credits?.total_credits 
    ? ((credits.used_credits / credits.total_credits) * 100)
    : 0;

  const projectedRunout = availableCredits > 0 
    ? Math.ceil(availableCredits / analytics.averageDaily)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Credit Analytics</h2>
          <p className="text-muted-foreground">
            Track your usage patterns and optimize credit consumption
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {format(new Date(), 'MMM dd, HH:mm')}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-primary text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Usage Efficiency</p>
                  <p className="text-2xl font-bold">{analytics.efficiency}%</p>
                  <p className="text-xs opacity-75">vs industry avg</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold">{projectedRunout}</p>
                  <p className="text-xs text-muted-foreground">at current usage</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Peak Usage</p>
                  <p className="text-2xl font-bold">{analytics.peakUsage}</p>
                  <p className="text-xs text-muted-foreground">credits/day</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Trend</p>
                  <p className="text-2xl font-bold">+{analytics.weeklyTrend}%</p>
                  <p className="text-xs text-muted-foreground">vs last week</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Credit Utilization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Credits Used</span>
              <span>{credits?.used_credits || 0} / {credits?.total_credits || 0}</span>
            </div>
            <Progress value={utilizationRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {utilizationRate.toFixed(1)}% of total credits consumed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">{availableCredits}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{credits?.used_credits || 0}</p>
              <p className="text-sm text-muted-foreground">Used</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{totalCreditspurchased}</p>
              <p className="text-sm text-muted-foreground">Total Purchased</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Usage Pattern</TabsTrigger>
          <TabsTrigger value="spending">Spending Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Daily Usage Pattern</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-1">
                {analytics.dailyUsage.slice(-14).map((day, index) => (
                  <div key={day.date} className="flex flex-col items-center gap-1">
                    <div 
                      className="bg-primary rounded-sm w-6 transition-all hover:bg-primary/80"
                      style={{ height: `${(day.credits / analytics.peakUsage) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground rotate-45 whitespace-nowrap">
                      {day.date}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Per Credit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Cost per Credit</p>
                    <p className="text-2xl font-bold">$0.025</p>
                    <p className="text-xs text-green-600">15% below market rate</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Spend</p>
                    <p className="text-2xl font-bold">$21.00</p>
                    <p className="text-xs text-muted-foreground">840 credits used</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Bulk Purchase Savings</p>
                    <p className="text-2xl font-bold text-green-600">$3.50</p>
                    <p className="text-xs text-muted-foreground">vs individual purchases</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Projected Monthly</p>
                    <p className="text-2xl font-bold">$28.00</p>
                    <p className="text-xs text-orange-600">+$7.00 vs current</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Optimize Purchase Timing</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Consider purchasing 1,000 credits now. Based on your usage pattern, 
                    this will save $4.20 over individual purchases.
                  </p>
                </div>
                
                <div className="p-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
                  <p className="font-medium text-green-900 dark:text-green-100">Usage Efficiency</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You're using credits 23% more efficiently than last month. 
                    Your document processing workflow shows the best ROI.
                  </p>
                </div>

                <div className="p-4 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20">
                  <p className="font-medium text-orange-900 dark:text-orange-100">Peak Usage Alert</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You typically use 40% more credits on Mondays. Consider batch processing 
                    weekend documents to smooth out usage.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditAnalytics;