
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCostCenters } from "@/hooks/useCostCenters";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Loader2, TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";
import { useMemo } from "react";

const CostAnalysis = () => {
  const { costCenters, isLoading: costCentersLoading } = useCostCenters();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { formatCurrency } = useCurrencyFormatter();

  const isLoading = costCentersLoading || transactionsLoading;

  // Calculate cost center analysis
  const costAnalysis = useMemo(() => {
    if (!transactions || !costCenters) return [];

    return costCenters.map(center => {
      // Filter transactions for this cost center (assuming all transactions are expenses for cost center analysis)
      const centerTransactions = transactions.filter(
        tx => tx.cost_center === center.id && Number(tx.amount) < 0
      );

      const totalSpent = centerTransactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount)), 0);
      const budgetAllocation = Number(center.budget_allocation);
      const remainingBudget = budgetAllocation - totalSpent;
      const utilizationRate = budgetAllocation > 0 ? (totalSpent / budgetAllocation) * 100 : 0;

      return {
        ...center,
        totalSpent,
        remainingBudget,
        utilizationRate,
        transactionCount: centerTransactions.length,
        isOverBudget: totalSpent > budgetAllocation,
        formattedTotalSpent: formatCurrency(totalSpent),
        formattedBudgetAllocation: formatCurrency(budgetAllocation),
        formattedRemainingBudget: formatCurrency(remainingBudget),
      };
    });
  }, [transactions, costCenters, formatCurrency]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalBudget = costAnalysis.reduce((sum, center) => sum + Number(center.budget_allocation), 0);
    const totalSpent = costAnalysis.reduce((sum, center) => sum + center.totalSpent, 0);
    const totalRemaining = totalBudget - totalSpent;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      formattedTotalBudget: formatCurrency(totalBudget),
      formattedTotalSpent: formatCurrency(totalSpent),
      formattedTotalRemaining: formatCurrency(totalRemaining),
      overallUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  }, [costAnalysis, formatCurrency]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.formattedTotalBudget}</div>
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
            <div className="text-2xl font-bold">{totals.formattedTotalSpent}</div>
            <p className="text-xs text-muted-foreground">
              {totals.overallUtilization.toFixed(1)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.formattedTotalRemaining}</div>
            <p className="text-xs text-muted-foreground">
              {totals.totalRemaining >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Centers</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {costCenters.filter(center => center.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {costCenters.length} total centers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Center Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Center Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of spending by cost center
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {costAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p className="text-muted-foreground">No cost centers available for analysis</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {costAnalysis.map((center) => (
                    <Card key={center.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{center.name}</h3>
                            {center.description && (
                              <p className="text-sm text-muted-foreground">{center.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={center.is_active ? "default" : "secondary"}>
                              {center.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {center.isOverBudget && (
                              <Badge variant="destructive">Over Budget</Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-medium">{center.formattedBudgetAllocation}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Spent</p>
                            <p className="font-medium">{center.formattedTotalSpent}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Remaining</p>
                            <p className={`font-medium ${center.remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {center.formattedRemainingBudget}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Utilization</p>
                            <p className="font-medium">{center.utilizationRate.toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {costAnalysis.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p className="text-muted-foreground">No cost centers available for detailed analysis</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {costAnalysis.map((center) => (
                    <Card key={center.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{center.name}</CardTitle>
                            {center.description && (
                              <CardDescription>{center.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={center.is_active ? "default" : "secondary"}>
                              {center.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {center.isOverBudget && (
                              <Badge variant="destructive">Over Budget</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-2xl font-bold">{center.formattedBudgetAllocation}</p>
                              <p className="text-sm text-muted-foreground">Budget Allocated</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <p className="text-2xl font-bold">{center.formattedTotalSpent}</p>
                              <p className="text-sm text-muted-foreground">Total Spent</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                              <p className={`text-2xl font-bold ${center.remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {center.formattedRemainingBudget}
                              </p>
                              <p className="text-sm text-muted-foreground">Remaining</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span>Budget Utilization</span>
                            <span className="font-medium">{center.utilizationRate.toFixed(1)}%</span>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>{center.transactionCount} transactions recorded</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysis;
