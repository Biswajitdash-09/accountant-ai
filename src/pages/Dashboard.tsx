
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, PieChart, CheckSquare, Calendar, Bell } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { FinancialGoalsManager } from "@/components/dashboard/FinancialGoalsManager";
import { TaskManager } from "@/components/TaskManager";
import { DeadlineTracker } from "@/components/DeadlineTracker";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export const Dashboard = () => {
  const { formatCurrency } = useCurrencyFormatter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your financial activity.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
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
              value={formatCurrency(25000)}
              icon={DollarSign}
              trend={{
                value: 12,
                isPositive: true,
                period: "from last month"
              }}
            />
            <MetricCard
              title="Monthly Income"
              value={formatCurrency(8500)}
              icon={TrendingUp}
              trend={{
                value: 8,
                isPositive: true,
                period: "from last month"
              }}
            />
            <MetricCard
              title="Monthly Expenses"
              value={formatCurrency(6200)}
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
            <IncomeExpenseChart />
            <ExpenseChart />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RecentTransactions />
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
