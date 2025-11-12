import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialDataHub } from "@/hooks/useFinancialDataHub";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const SourceComparison = () => {
  const { financialData, isLoading } = useFinancialDataHub();
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) return <div className="animate-pulse">Loading comparison...</div>;
  if (!financialData) return <div>No data available</div>;

  // Calculate transactions per source
  const sourceStats = {
    traditional: {
      transactions: financialData.transactions.filter(t => t.source === 'traditional').length,
      income: financialData.transactions.filter(t => t.source === 'traditional' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expenses: financialData.transactions.filter(t => t.source === 'traditional' && t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    },
    crypto: {
      transactions: financialData.transactions.filter(t => t.source === 'crypto').length,
      income: financialData.transactions.filter(t => t.source === 'crypto' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expenses: financialData.transactions.filter(t => t.source === 'crypto' && t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    },
    investment: {
      transactions: financialData.transactions.filter(t => t.source === 'investment').length,
      income: financialData.transactions.filter(t => t.source === 'investment' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expenses: financialData.transactions.filter(t => t.source === 'investment' && t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    },
  };

  const comparisonData = [
    {
      source: 'Traditional',
      Income: sourceStats.traditional.income,
      Expenses: sourceStats.traditional.expenses,
      Net: sourceStats.traditional.income - sourceStats.traditional.expenses,
    },
    {
      source: 'Crypto',
      Income: sourceStats.crypto.income,
      Expenses: sourceStats.crypto.expenses,
      Net: sourceStats.crypto.income - sourceStats.crypto.expenses,
    },
    {
      source: 'Investments',
      Income: sourceStats.investment.income,
      Expenses: sourceStats.investment.expenses,
      Net: sourceStats.investment.income - sourceStats.investment.expenses,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Traditional Banking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(financialData.netWorth.breakdown.traditional)}</p>
              <p className="text-xs text-muted-foreground">Total Balance</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{formatCurrency(sourceStats.traditional.income)}</span>
              <span className="text-muted-foreground">income</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{formatCurrency(sourceStats.traditional.expenses)}</span>
              <span className="text-muted-foreground">expenses</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">{sourceStats.traditional.transactions} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Crypto Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(financialData.netWorth.breakdown.crypto)}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{formatCurrency(sourceStats.crypto.income)}</span>
              <span className="text-muted-foreground">income</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{formatCurrency(sourceStats.crypto.expenses)}</span>
              <span className="text-muted-foreground">expenses</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">{sourceStats.crypto.transactions} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(financialData.netWorth.breakdown.investments)}</p>
              <p className="text-xs text-muted-foreground">Total Value</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-green-600">{formatCurrency(sourceStats.investment.income)}</span>
              <span className="text-muted-foreground">income</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
              <span className="text-red-600">{formatCurrency(sourceStats.investment.expenses)}</span>
              <span className="text-muted-foreground">expenses</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">{sourceStats.investment.transactions} transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses by Source</CardTitle>
          <CardDescription>Compare financial activity across all sources</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="Income" fill="hsl(var(--primary))" />
              <Bar dataKey="Expenses" fill="hsl(var(--destructive))" />
              <Bar dataKey="Net" fill="hsl(var(--secondary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};