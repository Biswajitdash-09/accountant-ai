
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
import AIInsightsSummary from "@/components/dashboard/AIInsightsSummary";
import NetWorthDashboard from "@/components/dashboard/NetWorthDashboard";
import SmartAlertsWidget from "@/components/dashboard/SmartAlertsWidget";
import AdvancedExportDialog from "@/components/reports/AdvancedExportDialog";
import { TaskManager } from "@/components/TaskManager";
import { DeadlineTracker } from "@/components/DeadlineTracker";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import CurrencyConverter from "@/components/CurrencyConverter";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import DemoTutorial from "@/components/DemoTutorial";
import { PullToRefresh } from "@/components/mobile/TouchGestures";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNotificationService } from "@/hooks/useNotificationService";
import { useDemoMode } from "@/hooks/useDemoMode";
import { getDemoData } from "@/utils/demoData";
import DemoAccountBadge from "@/components/DemoAccountBadge";
import { toast } from "sonner";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isContextReady, setIsContextReady] = useState(false);

  // Check if contexts are ready before using hooks
  useEffect(() => {
    const checkContexts = () => {
      try {
        // Attempt to access contexts - if they throw, contexts aren't ready
        setIsContextReady(true);
      } catch (error) {
        console.warn('Contexts not ready yet:', error);
        // Retry after a short delay
        setTimeout(checkContexts, 100);
      }
    };
    checkContexts();
  }, []);

  // Only use context-dependent hooks after contexts are ready
  const { formatCurrency } = useCurrencyFormatter();
  const { selectedCurrency } = useCurrency();
  const { createNotification } = useNotificationService();
  const { isDemo } = useDemoMode();

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Dashboard refreshed");
  };

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

  // Income/Expense chart now fetches dynamic data internally

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

  // Show loading state while contexts initialize
  if (!isContextReady) {
    return (
      <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
        <div className="space-y-3 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted animate-pulse rounded" />
              <div className="h-4 w-96 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
        <div className="space-y-3 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! Here's an overview of your financial activity.
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <CurrencySwitcher />
              <AdvancedExportDialog />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="flex items-center gap-2 min-h-[44px] min-w-[44px] touch-manipulation"
              >
                <PlayCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tutorial</span>
              </Button>
            </div>
          </div>

        <DemoAccountBadge />

        <DemoTutorial 
          isOpen={showTutorial} 
          onClose={() => setShowTutorial(false)} 
        />

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm min-h-[44px] touch-manipulation px-2 sm:px-3 py-3">
                Overview
              </TabsTrigger>
              <TabsTrigger value="markets" className="text-xs sm:text-sm min-h-[44px] touch-manipulation px-2 sm:px-3 py-3">
                <Bitcoin className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Markets</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs sm:text-sm min-h-[44px] touch-manipulation px-2 sm:px-3 py-3">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="deadlines" className="text-xs sm:text-sm min-h-[44px] touch-manipulation px-2 sm:px-3 py-3">
                <span className="hidden sm:inline">Deadlines</span>
                <span className="sm:hidden">Due</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm min-h-[44px] touch-manipulation px-2 sm:px-3 py-3">
                <Bell className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="space-y-3 sm:space-y-6 mt-3 sm:mt-6">
            {/* Financial Metrics */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

            {/* AI Insights and Alerts */}
            <div className="grid gap-3 sm:gap-6 grid-cols-1 xl:grid-cols-2">
              <AIInsightsSummary />
              <SmartAlertsWidget />
            </div>

            {/* Net Worth */}
            <NetWorthDashboard />

            {/* Charts and Financial Goals */}
            <div className="grid gap-3 sm:gap-6 grid-cols-1 xl:grid-cols-2">
              <IncomeExpenseChart />
              <ExpenseChart data={expenseData} />
            </div>

            <div className="grid gap-3 sm:gap-6 grid-cols-1 xl:grid-cols-2">
              <RecentTransactions transactions={sampleTransactions} />
              <FinancialGoalsManager />
            </div>
          </TabsContent>

          <TabsContent value="markets" className="space-y-3 sm:space-y-6 mt-3 sm:mt-6">
            <div className="space-y-4 sm:space-y-8">
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

          <TabsContent value="tasks" className="space-y-3 sm:space-y-6 mt-3 sm:mt-6">
            <TaskManager />
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-3 sm:space-y-6 mt-3 sm:mt-6">
            <DeadlineTracker />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-3 sm:space-y-6 mt-3 sm:mt-6">
            <NotificationCenter />
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </PullToRefresh>
  );
};

export default Dashboard;
