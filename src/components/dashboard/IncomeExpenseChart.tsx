
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Loader2 } from "lucide-react";

const IncomeExpenseChart = () => {
  const { transactions, isLoading } = useTransactions();
  const { formatCurrency } = useCurrencyFormatter();

  const chartData = useMemo(() => {
    // Group transactions by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          income: 0,
          expense: 0,
        };
      }

      const amount = Number(transaction.amount);
      if (transaction.type === 'income') {
        acc[monthKey].income += amount;
      } else if (transaction.type === 'expense') {
        acc[monthKey].expense += amount;
      }

      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number }>);

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, data]) => data)
      .slice(-6); // Last 6 months
  }, [transactions]);

  const totals = useMemo(() => {
    const income = chartData.reduce((sum, item) => sum + item.income, 0);
    const expense = chartData.reduce((sum, item) => sum + item.expense, 0);
    return {
      income,
      expense,
      net: income - expense,
      formattedIncome: formatCurrency(income),
      formattedExpense: formatCurrency(expense),
      formattedNet: formatCurrency(income - expense)
    };
  }, [chartData, formatCurrency]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>No transaction data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No transactions recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1">
            <p className="text-green-600">
              Income: {formatCurrency(payload[0]?.value || 0)}
            </p>
            <p className="text-red-600">
              Expense: {formatCurrency(payload[1]?.value || 0)}
            </p>
            <p className="text-blue-600 font-medium">
              Net: {formatCurrency((payload[0]?.value || 0) - (payload[1]?.value || 0))}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>
          Net income: {totals.formattedNet} (Income: {totals.formattedIncome}, Expenses: {totals.formattedExpense})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: 'hsl(var(--foreground))' }}
                tickFormatter={(value) => formatCurrency(value, undefined, undefined, { showSymbol: true, showCode: false, decimals: 0 })}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="income" 
                fill="hsl(var(--chart-1))" 
                name="Income"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="expense" 
                fill="hsl(var(--chart-2))" 
                name="Expenses"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
