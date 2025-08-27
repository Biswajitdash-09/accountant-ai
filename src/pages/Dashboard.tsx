
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, PieChart, CheckSquare, Calendar, Bell, Bitcoin, PlayCircle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import ExpenseChart from "@/components/dashboard/ExpenseChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import FinancialGoalsManager from "@/components/dashboard/FinancialGoalsManager";
import { TaskManager } from "@/components/TaskManager";
import { DeadlineTracker } from "@/components/DeadlineTracker";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import CurrencyConverter from "@/components/CurrencyConverter";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import DemoTutorial from "@/components/DemoTutorial";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNotificationService } from "@/hooks/useNotificationService";
import { useDemoMode } from "@/hooks/useDemoMode";
import { getDemoData } from "@/utils/demoData";
import DemoAccountBadge from "@/components/DemoAccountBadge";

const Dashboard = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const { selectedCurrency } = useCurrency();
  const { createNotification } = useNotificationService();
  const { isDemo } = useDemoMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showTutorial, setShowTutorial] = useState(false);

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

  // Use demo data if in demo mode
  const demoTransactions = isDemo ? getDemoData('transactions') : [];
  const demoAccounts = isDemo ? getDemoData('accounts') : [];

  // Calculate metrics from demo data or use sample data  
  // Recalculate when currency changes to ensure fresh formatting
  const calculateMetrics = () => {
    if (isDemo && demoTransactions.length > 0) {
      const totalIncome = demoTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = demoTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const totalBalance = demoAccounts.reduce((sum, acc) => sum + acc.balance, 0);
      
      return {
        totalBalance,
        monthlyIncome: totalIncome,
        monthlyExpenses: totalExpenses,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(0) : '0'
      };
    }
    
    // Fallback sample data
    return {
      totalBalance: 25000,
      monthlyIncome: 8500,
      monthlyExpenses: 6200,
      savingsRate: '27'
    };
  };

  const metrics = calculateMetrics();
  
  // Ensure metrics recalculate when currency changes
  useEffect(() => {
    // This effect will run when selectedCurrency changes, 
    // triggering a re-render with updated currency formatting
  }, [selectedCurrency]);

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

  const sampleTransactions = isDemo ? demoTransactions.slice(0, 3) : [
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
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your financial activity.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <CurrencySwitcher />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2"
            >
              <PlayCircle className="h-4 w-4" />
              Tutorial
            </Button>
          </div>
        </div>

        <DemoAccountBadge />

        <DemoTutorial 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)} 
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm p-2 sm:p-3">
              Overview
            </TabsTrigger>
            <TabsTrigger value="markets" className="text-xs sm:text-sm p-2 sm:p-3">
              <Bitcoin className="h-4 w-4 mr-1" />
              Markets
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs sm:text-sm p-2 sm:p-3">
              Tasks
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="text-xs sm:text-sm p-2 sm:p-3">
              Deadlines
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm p-2 sm:p-3">
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Financial Metrics */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Balance"
                value={metrics.totalBalance}
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
                value={metrics.monthlyIncome}
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
                value={metrics.monthlyExpenses}
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
                value={`${metrics.savingsRate}%`}
                icon={PieChart}
                trend={{
                  value: 4,
                  isPositive: true,
                  period: "from last month"
                }}
              />
            </div>

            {/* Charts and Financial Goals */}
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              <IncomeExpenseChart data={incomeExpenseData} />
              <ExpenseChart data={expenseData} />
            </div>

            <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
              <RecentTransactions transactions={sampleTransactions} />
              <FinancialGoalsManager />
            </div>
          </TabsContent>

          <TabsContent value="markets" className="space-y-6">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Bitcoin className="h-6 w-6 text-primary" />
                  Markets & Portfolio Tracking
                </h2>
                <p className="text-muted-foreground">
                  Track your crypto portfolio and convert currencies in real-time.
                </p>
              </div>

              <Tabs defaultValue="crypto" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="crypto" className="gap-2">
                    <Bitcoin className="h-4 w-4" />
                    Crypto Portfolio
                  </TabsTrigger>
                  <TabsTrigger value="currency" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Currency Converter
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="crypto" className="space-y-6">
                  <CryptoPortfolio />
                </TabsContent>

                <TabsContent value="currency" className="space-y-6">
                  <CurrencyConverter />
                </TabsContent>
              </Tabs>
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
    </div>
  );
};

export default Dashboard;
