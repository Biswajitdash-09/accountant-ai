
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, DollarSign, Target, PieChart } from "lucide-react";
import RevenueDashboard from "@/components/dashboard/RevenueDashboard";
import CostAnalysis from "@/components/dashboard/CostAnalysis";
import BudgetPlanning from "@/components/dashboard/BudgetPlanning";
import FinancialGoalsManager from "@/components/dashboard/FinancialGoalsManager";
import BalanceSheetManager from "@/components/dashboard/BalanceSheetManager";
import AddFinancialDataModal from "@/components/modals/AddFinancialDataModal";
import { useRevenueStreams } from "@/hooks/useRevenueStreams";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { useBalanceSheet } from "@/hooks/useBalanceSheet";
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";

const FinancialManagement = () => {
  const { revenueStreams } = useRevenueStreams();
  const { financialGoals } = useFinancialGoals();
  const { budgets } = useBudgets();
  const { balanceSheetItems } = useBalanceSheet();
  const { transactions } = useTransactions();

  const overviewMetrics = useMemo(() => {
    const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.actual_amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalAssets = balanceSheetItems
      .filter(item => item.item_type.includes('asset'))
      .reduce((sum, item) => sum + item.amount, 0);
    
    const totalLiabilities = balanceSheetItems
      .filter(item => item.item_type.includes('liability'))
      .reduce((sum, item) => sum + item.amount, 0);

    const netWorth = totalAssets - totalLiabilities;
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Calculate monthly trends
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    
    const currentMonthRevenue = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthRevenue = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(lastMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const revenueTrend = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      netWorth,
      totalAssets,
      totalLiabilities,
      activeGoals: financialGoals.filter(g => !g.is_achieved).length,
      revenueTrend,
      activeBudgets: budgets.filter(b => b.is_active).length,
    };
  }, [revenueStreams, transactions, balanceSheetItems, financialGoals, budgets]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Comprehensive financial overview and management</p>
        </div>
        <AddFinancialDataModal>
          <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Financial Data
          </div>
        </AddFinancialDataModal>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${overviewMetrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{
            value: Math.abs(overviewMetrics.revenueTrend),
            isPositive: overviewMetrics.revenueTrend > 0,
            period: "vs last month",
          }}
        />
        <MetricCard
          title="Net Profit"
          value={`$${overviewMetrics.profit.toLocaleString()}`}
          icon={TrendingUp}
          trend={{
            value: Math.abs(overviewMetrics.profitMargin),
            isPositive: overviewMetrics.profit > 0,
            period: "margin",
          }}
        />
        <MetricCard
          title="Net Worth"
          value={`$${overviewMetrics.netWorth.toLocaleString()}`}
          icon={Target}
          trend={{
            value: Math.abs(overviewMetrics.netWorth),
            isPositive: overviewMetrics.netWorth > 0,
            period: "assets - liabilities",
          }}
        />
        <MetricCard
          title="Active Goals"
          value={overviewMetrics.activeGoals.toString()}
          icon={PieChart}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueDashboard />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <CostAnalysis />
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <BudgetPlanning />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <FinancialGoalsManager />
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <BalanceSheetManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
