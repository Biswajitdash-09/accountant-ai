import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmartInsightCard } from "@/components/finance/SmartInsightCard";
import { GlassCard } from "@/components/ui/glass-card";
import { SmartButton } from "@/components/ui/smart-button";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  FileText,
  Download,
  Filter,
  Calendar,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

const mockData = {
  revenue: [
    { month: "Jan", amount: 45000, target: 42000 },
    { month: "Feb", amount: 48000, target: 45000 },
    { month: "Mar", amount: 52000, target: 48000 },
    { month: "Apr", amount: 49000, target: 50000 },
    { month: "May", amount: 55000, target: 52000 },
    { month: "Jun", amount: 58000, target: 55000 },
  ],
  expenses: [
    { category: "Office Rent", amount: 12000, percentage: 35 },
    { category: "Salaries", amount: 8000, percentage: 25 },
    { category: "Marketing", amount: 5000, percentage: 15 },
    { category: "Utilities", amount: 3000, percentage: 10 },
    { category: "Software", amount: 2500, percentage: 8 },
    { category: "Other", amount: 2200, percentage: 7 },
  ],
  profitLoss: [
    { month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
    { month: "Feb", revenue: 48000, expenses: 34000, profit: 14000 },
    { month: "Mar", revenue: 52000, expenses: 36000, profit: 16000 },
    { month: "Apr", revenue: 49000, expenses: 35000, profit: 14000 },
    { month: "May", revenue: 55000, expenses: 38000, profit: 17000 },
    { month: "Jun", revenue: 58000, expenses: 40000, profit: 18000 },
  ]
};

const COLORS = [
  'hsl(var(--finance-highlight))',
  'hsl(var(--finance-positive))',
  'hsl(var(--finance-warning))',
  'hsl(var(--finance-negative))',
  'hsl(var(--primary))',
  'hsl(var(--accent))'
];

export const EnhancedReportsPage = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const [timeFrame, setTimeFrame] = useState("6months");
  const [reportType, setReportType] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const totalRevenue = mockData.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = mockData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-6 space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <motion.h1 
              className="text-4xl font-bold bg-gradient-to-r from-primary to-finance-highlight bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Financial Reports
            </motion.h1>
            <p className="text-muted-foreground">AI-powered insights and comprehensive financial analysis</p>
          </div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <SmartButton
              onClick={handleGenerateReport}
              loading={isGenerating}
              icon={<FileText className="h-4 w-4" />}
              className="gradient-primary"
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </SmartButton>
          </motion.div>
        </div>

        {/* Smart Insights Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SmartInsightCard
            title="Total Revenue"
            value={totalRevenue}
            change={12.5}
            changeType="positive"
            icon={TrendingUp}
            trend="up"
            priority="medium"
            currency={true}
            insight="Revenue grew 12.5% compared to last period"
          />
          
          <SmartInsightCard
            title="Net Profit"
            value={netProfit}
            change={8.3}
            changeType="positive"
            icon={DollarSign}
            trend="up"
            priority="low"
            currency={true}
            insight="Profit margin improved to 32.4%"
          />
          
          <SmartInsightCard
            title="Total Expenses"
            value={totalExpenses}
            change={-3.2}
            changeType="positive"
            icon={TrendingDown}
            trend="down"
            priority="medium"
            currency={true}
            insight="Expenses reduced by 3.2% through optimization"
          />
          
          <SmartInsightCard
            title="Profit Margin"
            value={profitMargin}
            change={2.1}
            changeType="positive"
            icon={Target}
            trend="up"
            priority="high"
            insight="Margin increased by 2.1 percentage points"
          />
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={reportType} onValueChange={setReportType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="profitloss" className="gap-2">
              <DollarSign className="h-4 w-4" />
              P&L
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Revenue vs Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockData.revenue}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="amount" fill="hsl(var(--finance-highlight))" name="Actual Revenue" />
                      <Bar dataKey="target" fill="hsl(var(--finance-positive))" name="Target" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </GlassCard>

              <GlassCard>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Expense Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockData.expenses}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {mockData.expenses.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <GlassCard>
              <CardHeader>
                <CardTitle>Revenue Trends & Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={mockData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--finance-highlight))"
                      fill="hsl(var(--finance-highlight))"
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(var(--finance-positive))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </GlassCard>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockData.expenses.map((expense, index) => (
                      <motion.div
                        key={expense.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{expense.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatCurrency(expense.amount)}</div>
                          <div className="text-sm text-muted-foreground">{expense.percentage}%</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </GlassCard>

              <GlassCard>
                <CardHeader>
                  <CardTitle>Expense Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-finance-positive/10 border border-finance-positive/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-finance-positive" />
                        <span className="font-medium text-finance-positive">Cost Savings Opportunity</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reduce software subscriptions by consolidating tools - potential savings: $500/month
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-finance-warning/10 border border-finance-warning/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-finance-warning" />
                        <span className="font-medium text-finance-warning">Budget Alert</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Marketing spend is 15% over budget this month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="profitloss" className="space-y-6">
            <GlassCard>
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockData.profitLoss}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--finance-highlight))"
                      strokeWidth={3}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(var(--finance-negative))"
                      strokeWidth={3}
                      name="Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(var(--finance-positive))"
                      strokeWidth={3}
                      name="Net Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};