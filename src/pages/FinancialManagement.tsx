
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, DollarSign, Target, PieChart } from "lucide-react";
import RevenueDashboard from "@/components/dashboard/RevenueDashboard";
import CostAnalysis from "@/components/dashboard/CostAnalysis";
import { useRevenueStreams } from "@/hooks/useRevenueStreams";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useBudgetTemplates } from "@/hooks/useBudgetTemplates";
import { useBalanceSheet } from "@/hooks/useBalanceSheet";
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo } from "react";
import MetricCard from "@/components/dashboard/MetricCard";

const FinancialManagement = () => {
  const { revenueStreams } = useRevenueStreams();
  const { financialGoals } = useFinancialGoals();
  const { budgetTemplates } = useBudgetTemplates();
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

    return {
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
      netWorth,
      totalAssets,
      totalLiabilities,
      activeGoals: financialGoals.filter(g => !g.is_achieved).length,
    };
  }, [revenueStreams, transactions, balanceSheetItems, financialGoals]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Management</h1>
          <p className="text-muted-foreground">Comprehensive financial overview and management</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Financial Data
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${overviewMetrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{
            value: 12.5,
            positive: true,
          }}
          description="All revenue streams"
        />
        <MetricCard
          title="Net Profit"
          value={`$${overviewMetrics.profit.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            value: Math.abs(overviewMetrics.profitMargin),
            positive: overviewMetrics.profit > 0,
          }}
          description={`${overviewMetrics.profitMargin.toFixed(1)}% margin`}
        />
        <MetricCard
          title="Net Worth"
          value={`$${overviewMetrics.netWorth.toLocaleString()}`}
          icon={<Target className="h-4 w-4" />}
          description="Assets minus liabilities"
        />
        <MetricCard
          title="Active Goals"
          value={overviewMetrics.activeGoals.toString()}
          icon={<PieChart className="h-4 w-4" />}
          description="Financial goals in progress"
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
          <Card>
            <CardHeader>
              <CardTitle>Budget Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Budget planning features coming soon...</p>
                <p className="text-sm">Create and manage intelligent budgets based on your financial data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Financial goals tracking coming soon...</p>
                <p className="text-sm">Set and track your financial objectives with AI-powered insights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <p>Balance sheet features coming soon...</p>
                <p className="text-sm">Comprehensive balance sheet with assets, liabilities, and equity tracking</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialManagement;
