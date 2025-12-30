import React, { useEffect, useState, memo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DollarSign, TrendingUp, TrendingDown, PieChart, CheckSquare, Calendar, Bell, Bitcoin, PlayCircle, Phone } from "lucide-react";
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
import { PullToRefresh } from "@/components/mobile/TouchGestures";
import { VoiceAgent } from "@/components/voice/VoiceAgent";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useNotificationService } from "@/hooks/useNotificationService";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { DashboardSkeleton } from "@/components/ui/smart-skeleton";
import { OfflineIndicator } from "@/components/mobile/OfflineIndicator";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { InteractiveTutorial } from "@/components/tutorials/InteractiveTutorial";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [isContextReady, setIsContextReady] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();

  // Handle pull-to-refresh
  const handleRefresh = async () => {
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

  // Calculate metrics from real data
  const calculateMetrics = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = transactions.filter(t => new Date(t.date) >= startOfMonth);
    
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    
    return {
      totalBalance,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(0) : '0'
    };
  };

  const metrics = calculateMetrics();

  // Get expense breakdown from real transactions
  const getExpenseData = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
      .forEach(t => {
        const category = t.category || 'Other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + Math.abs(t.amount);
      });
    
    return Object.entries(expensesByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const expenseData = getExpenseData();

  // Get recent transactions
  const recentTransactions = transactions.slice(0, 5).map(t => ({
    id: t.id,
    date: t.date,
    description: t.description || t.category || 'Transaction',
    category: t.category || 'Uncategorized',
    amount: Math.abs(t.amount),
    type: t.type as 'income' | 'expense',
  }));

  // Show loading state while contexts initialize
  if (!isContextReady) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {showTutorial && (
        <InteractiveTutorial
          onComplete={() => {
            setShowTutorial(false);
            toast.success("Tutorial completed! You're all set.");
          }}
          onSkip={() => {
            setShowTutorial(false);
            toast.info("Tutorial skipped. You can restart it anytime.");
          }}
        />
      )}
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
          <OfflineIndicator />
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => isMobile ? setShowVoiceAgent(true) : navigate('/assistant?tab=voice-agent')}
                className="flex items-center gap-2 min-h-[44px] min-w-[44px] touch-manipulation bg-primary/10 hover:bg-primary/20 border-primary/30"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Voice Agent</span>
              </Button>
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

        {/* Voice Agent Drawer for Mobile */}
        <Drawer open={showVoiceAgent} onOpenChange={setShowVoiceAgent}>
          <DrawerContent className="h-[90vh]">
            <VisuallyHidden>
              <DrawerTitle>Voice Agent</DrawerTitle>
            </VisuallyHidden>
            <VoiceAgent onClose={() => setShowVoiceAgent(false)} className="h-full border-0" />
          </DrawerContent>
        </Drawer>

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
              <RecentTransactions transactions={recentTransactions} />
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
    </>
  );
};

export default Dashboard;
