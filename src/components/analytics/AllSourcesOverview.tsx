import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialDataHub } from "@/hooks/useFinancialDataHub";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const AllSourcesOverview = () => {
  const { financialData, isLoading } = useFinancialDataHub();
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return <div className="animate-pulse">Loading unified data...</div>;
  }

  if (!financialData) {
    return <div>No financial data available</div>;
  }

  const netWorthData = [
    { name: 'Traditional Accounts', value: financialData.netWorth.breakdown.traditional },
    { name: 'Crypto Holdings', value: financialData.netWorth.breakdown.crypto },
    { name: 'Investments', value: financialData.netWorth.breakdown.investments },
  ];

  const cashFlowData = [
    { name: 'Income', amount: financialData.cashFlow.income },
    { name: 'Expenses', amount: financialData.cashFlow.expenses },
    { name: 'Savings', amount: financialData.cashFlow.savings },
  ];

  return (
    <div className="space-y-6">
      {/* Net Worth Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.netWorth.total)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {financialData.netWorth.trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              All sources combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Traditional</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.netWorth.breakdown.traditional)}</div>
            <p className="text-xs text-muted-foreground">Bank accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crypto</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.netWorth.breakdown.crypto)}</div>
            <p className="text-xs text-muted-foreground">Digital assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.netWorth.breakdown.investments)}</div>
            <p className="text-xs text-muted-foreground">Stocks & assets</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Distribution</CardTitle>
            <CardDescription>Breakdown by asset type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={netWorthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {netWorthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cash Flow (Last 30 Days)</CardTitle>
            <CardDescription>Income, expenses, and savings</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="amount" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions (All Sources)</CardTitle>
          <CardDescription>Last 10 transactions across all accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {financialData.transactions.slice(0, 10).map((transaction, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()} • {transaction.source}
                  </p>
                </div>
                <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};