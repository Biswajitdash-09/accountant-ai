
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, AlertCircle } from "lucide-react";

interface BudgetSummary {
  formattedTotalBudgeted: string;
  formattedTotalSpent: string;
  formattedRemaining: string;
  overallProgress: number;
  remaining: number;
  budgetsCount: number;
}

interface BudgetOverviewCardsProps {
  budgetSummary: BudgetSummary;
}

export const BudgetOverviewCards = ({ budgetSummary }: BudgetOverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{budgetSummary.formattedTotalBudgeted}</div>
          <p className="text-xs text-muted-foreground">
            Across {budgetSummary.budgetsCount} budget{budgetSummary.budgetsCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{budgetSummary.formattedTotalSpent}</div>
          <Progress value={budgetSummary.overallProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Remaining</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{budgetSummary.formattedRemaining}</div>
          <p className="text-xs text-muted-foreground">
            {budgetSummary.remaining >= 0 ? 'Under budget' : 'Over budget'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
