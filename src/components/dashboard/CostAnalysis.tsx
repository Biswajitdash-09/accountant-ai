
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCostCenters } from "@/hooks/useCostCenters";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Loader2, TrendingDown, Target, BarChart3 } from "lucide-react";

const CostAnalysis = () => {
  const { costCenters, isLoading: centersLoading } = useCostCenters();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { formatCurrency } = useCurrencyFormatter();

  // Calculate cost center performance
  const costAnalysis = useMemo(() => {
    if (!costCenters.length || !transactions.length) return [];

    return costCenters.map(center => {
      // Find transactions assigned to this cost center
      const centerTransactions = transactions.filter(
        t => t.cost_center_id === center.id && t.type === 'expense'
      );

      const totalSpent = centerTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const budgetAllocated = Number(center.budget_allocation);
      const remaining = budgetAllocated - totalSpent;
      const utilizationRate = budgetAllocated > 0 ? (totalSpent / budgetAllocated) * 100 : 0;

      return {
        ...center,
        totalSpent,
        budgetAllocated,
        remaining,
        utilizationRate,
        transactionCount: centerTransactions.length,
        avgTransactionAmount: centerTransactions.length > 0 ? totalSpent / centerTransactions.length : 0,
        formattedTotalSpent: formatCurrency(totalSpent),
        formattedBudgetAllocated: formatCurrency(budgetAllocated),
        formattedRemaining: formatCurrency(remaining),
        formattedAvgTransaction: formatCurrency(centerTransactions.length > 0 ? totalSpent / centerTransactions.length : 0)
      };
    });
  }, [costCenters, transactions, formatCurrency]);

  // Overall summary
  const summary = useMemo(() => {
    const totalBudget = costAnalysis.reduce((sum, center) => sum + center.budgetAllocated, 0);
    const totalSpent = costAnalysis.reduce((sum, center) => sum + center.totalSpent, 0);
    const totalRemaining = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      formattedTotalBudget: formatCurrency(totalBudget),
      formattedTotalSpent: formatCurrency(totalSpent),
      formattedTotalRemaining: formatCurrency(totalRemaining),
      overallUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  }, [costAnalysis, formatCurrency]);

  if (centersLoading || transactionsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!costCenters.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis</CardTitle>
          <CardDescription>No cost centers configured yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create cost centers to track departmental spending and budget allocation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.formattedTotalBudget}</div>
            <p className="text-xs text-muted-foreground">
              Across {costCenters.length} cost centers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.formattedTotalSpent}</div>
            <p className="text-xs text-muted-foreground">
              {summary.overallUtilization.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.formattedTotalRemaining}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Center Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Center Performance</CardTitle>
          <CardDescription>
            Budget utilization and spending analysis by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {costAnalysis.map((center) => (
              <Card key={center.id} className="border-l-4 border-l-primary/20">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">{center.name}</h3>
                      {center.description && (
                        <p className="text-sm text-muted-foreground">{center.description}</p>
                      )}
                    </div>
                    <Badge variant={center.is_active ? "default" : "secondary"}>
                      {center.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget Allocated</p>
                      <p className="font-semibold">{center.formattedBudgetAllocated}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="font-semibold">{center.formattedTotalSpent}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className={`font-semibold ${center.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {center.formattedRemaining}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Utilization</p>
                      <p className="font-semibold">{center.utilizationRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {center.transactionCount > 0 && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Transactions</p>
                        <p className="font-semibold">{center.transactionCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Transaction</p>
                        <p className="font-semibold">{center.formattedAvgTransaction}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysis;
