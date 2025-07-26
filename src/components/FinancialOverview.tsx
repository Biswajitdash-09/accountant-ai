
import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTransactions } from "@/hooks/useTransactions";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { TrendingUp, TrendingDown, Target, Wallet, PieChart, Calendar } from "lucide-react";

const FinancialOverview = () => {
  const { transactions } = useTransactions();
  const { financialGoals } = useFinancialGoals();
  const { budgets } = useBudgets();
  const { accounts } = useAccounts();
  const { formatCurrency } = useCurrencyFormatter();

  // Calculate current month data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const monthlyIncome = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [currentMonthTransactions]);

  const monthlyExpenses = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [currentMonthTransactions]);

  const netIncome = monthlyIncome - monthlyExpenses;
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

  // Active budgets for current month
  const activeBudgets = useMemo(() => {
    return budgets.filter(budget => {
      if (!budget.is_active) return false;
      
      const budgetStart = new Date(budget.start_date);
      const budgetEnd = new Date(budget.end_date);
      const now = new Date();
      
      return now >= budgetStart && now <= budgetEnd;
    });
  }, [budgets]);

  const totalBudgetAmount = activeBudgets.reduce((sum, budget) => sum + budget.total_budget, 0);
  const totalSpent = activeBudgets.reduce((sum, budget) => sum + budget.actual_spent, 0);
  const budgetUtilization = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

  // Financial goals progress
  const activeGoals = financialGoals.filter(goal => !goal.is_achieved);
  const achievedGoalsCount = financialGoals.filter(goal => goal.is_achieved).length;
  const totalGoals = financialGoals.length;

  const goalCategories = useMemo(() => {
    const categories = ['savings', 'investment', 'debt_reduction', 'revenue', 'expense_reduction'];
    return categories.map(category => {
      const categoryGoals = financialGoals.filter(goal => goal.goal_type === category);
      const totalTarget = categoryGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
      const totalCurrent = categoryGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
      const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
      
      return {
        category,
        count: categoryGoals.length,
        totalTarget,
        totalCurrent,
        progress: Math.min(progress, 100)
      };
    }).filter(cat => cat.count > 0);
  }, [financialGoals]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyIncome, undefined, undefined, { showSymbol: true, decimals: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {currentMonthTransactions.filter(t => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenses, undefined, undefined, { showSymbol: true, decimals: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {currentMonthTransactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netIncome >= 0 ? '+' : ''}
              {formatCurrency(netIncome, undefined, undefined, { showSymbol: true, decimals: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month's profit/loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalBalance, undefined, undefined, { showSymbol: true, decimals: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Budget Overview
            </CardTitle>
            <CardDescription>
              Active budgets for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeBudgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active budgets for this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Budget Utilization</span>
                  <Badge variant={budgetUtilization > 90 ? "destructive" : budgetUtilization > 75 ? "secondary" : "default"}>
                    {budgetUtilization.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={budgetUtilization} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Spent: {formatCurrency(totalSpent, undefined, undefined, { showSymbol: true, decimals: 2 })}</span>
                  <span>Budget: {formatCurrency(totalBudgetAmount, undefined, undefined, { showSymbol: true, decimals: 2 })}</span>
                </div>

                <div className="space-y-3 pt-2">
                  {activeBudgets.slice(0, 3).map((budget) => {
                    const utilization = (budget.actual_spent / budget.total_budget) * 100;
                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{budget.name}</span>
                          <Badge variant={utilization > 90 ? "destructive" : "secondary"} className="text-xs">
                            {utilization.toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={utilization} className="h-1" />
                      </div>
                    );
                  })}
                  
                  {activeBudgets.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{activeBudgets.length - 3} more budget{activeBudgets.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Financial Goals
            </CardTitle>
            <CardDescription>
              Progress towards your financial objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            {financialGoals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No financial goals set</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Goals Achieved</span>
                  <Badge variant="default">
                    {achievedGoalsCount} of {totalGoals}
                  </Badge>
                </div>
                
                {totalGoals > 0 && (
                  <Progress value={(achievedGoalsCount / totalGoals) * 100} className="h-2" />
                )}

                <div className="space-y-3 pt-2">
                  {goalCategories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {category.category.replace(/_/g, ' ')} ({category.count})
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(category.totalCurrent, undefined, undefined, { showSymbol: true, decimals: 0 })} / {formatCurrency(category.totalTarget, undefined, undefined, { showSymbol: true, decimals: 0 })}
                        </span>
                      </div>
                      <Progress value={category.progress} className="h-1" />
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  {activeGoals.length} goal{activeGoals.length !== 1 ? 's' : ''} in progress
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialOverview;
