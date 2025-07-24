
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, PieChart, CheckSquare, Calendar, Bell } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import FinancialGoalsManager from "@/components/dashboard/FinancialGoalsManager";
import { TaskManager } from "@/components/TaskManager";
import { DeadlineTracker } from "@/components/DeadlineTracker";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useNotificationService } from "@/hooks/useNotificationService";

const Dashboard = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const { createNotification } = useNotificationService();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // Handle tab changes from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams(value === 'overview' ? {} : { tab: value });
  };

  // Sample data for charts
  const incomeExpenseData = [
    { month: "Jan", income: 8000, expenses: 5500 },
    { month: "Feb", income: 8500, expenses: 6000 },
    { month: "Mar", income: 9000, expenses: 6200 },
    { month: "Apr", income: 8800, expenses: 5800 },
    { month: "May", income: 9500, expenses: 6500 },
    { month: "Jun", income: 10000, expenses: 7000 },
  ];

  const expenseData = [
    { name: "Housing", value: 2500 },
    { name: "Food", value: 800 },
    { name: "Transportation", value: 600 },
    { name: "Utilities", value: 400 },
    { name: "Entertainment", value: 300 },
  ];

  const sampleTransactions = [
    {
      id: "1",
      date: "2024-01-15",
      description: "Client Payment",
      category: "Revenue",
      amount: 2500,
      type: "income" as const,
    },
    {
      id: "2",
      date: "2024-01-14",
      description: "Office Supplies",
      category: "Business",
      amount: 150,
      type: "expense" as const,
    },
    {
      id: "3",
      date: "2024-01-13",
      description: "Software Subscription",
      category: "Technology",
      amount: 99,
      type: "expense" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your financial activity.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Balance"
              value={25000}
              currency={true}
              icon={DollarSign}
              trend={{
                value: 12,
                isPositive: true,
                period: "from last month"
              }}
            />
            <MetricCard
              title="Monthly Income"
              value={8500}
              currency={true}
              icon={TrendingUp}
              trend={{
                value: 8,
                isPositive: true,
                period: "from last month"
              }}
            />
            <MetricCard
              title="Monthly Expenses"
              value={6200}
              currency={true}
              icon={TrendingDown}
              trend={{
                value: 3,
                isPositive: false,
                period: "from last month"
              }}
            />
            <MetricCard
              title="Savings Rate"
              value="27%"
              icon={PieChart}
              trend={{
                value: 4,
                isPositive: true,
                period: "from last month"
              }}
            />
          </div>

          {/* Charts and Financial Goals */}
          <div className="grid gap-6 md:grid-cols-2">
            <IncomeExpenseChart data={incomeExpenseData} />
            <ExpenseChart data={expenseData} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RecentTransactions transactions={sampleTransactions} />
            <FinancialGoalsManager />
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskManager />
        </TabsContent>

        <TabsContent value="deadlines" className="space-y-6">
          <DeadlineTracker />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
