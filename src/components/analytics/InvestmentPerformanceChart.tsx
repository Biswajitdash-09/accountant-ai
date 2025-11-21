import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialDataHub } from "@/hooks/useFinancialDataHub";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useInvestmentChartData } from "@/hooks/useChartData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const InvestmentPerformanceChart = () => {
  const { financialData, getInvestmentPerformance, isLoading: dataLoading } = useFinancialDataHub();
  const { data: historicalData, isLoading: chartLoading } = useInvestmentChartData(12);
  const { formatCurrency } = useCurrencyFormatter();

  const isLoading = dataLoading || chartLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  const performance = getInvestmentPerformance();
  if (!performance || !financialData || !historicalData) {
    return <div>No investment data available</div>;
  }

  const totalROI = performance.total > 0 ? ((performance.total - (performance.stocks.value * 0.85 + performance.crypto.value * 0.75)) / (performance.stocks.value * 0.85 + performance.crypto.value * 0.75) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performance.total)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +{totalROI}% ROI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stocks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performance.stocks.value)}</div>
            <p className="text-xs text-muted-foreground">{performance.stocks.count} holdings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crypto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performance.crypto.value)}</div>
            <p className="text-xs text-muted-foreground">{performance.crypto.count} holdings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Real Estate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performance.realEstate.value)}</div>
            <p className="text-xs text-muted-foreground">{performance.realEstate.count} properties</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment Performance Over Time</CardTitle>
          <CardDescription>Last 12 months of portfolio performance (dynamically updated)</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="stocks" stroke="hsl(var(--primary))" strokeWidth={2} name="Stocks" />
              <Line type="monotone" dataKey="crypto" stroke="hsl(var(--secondary))" strokeWidth={2} name="Crypto" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialData.investments.stocks.slice(0, 5).map((stock, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{stock.asset_symbol}</p>
                    <p className="text-xs text-muted-foreground">{stock.asset_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(stock.quantity * stock.purchase_price)}</p>
                    <p className="text-xs text-green-600">+12.5%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Stocks</span>
                  <span className="font-medium">
                    {((performance.stocks.value / performance.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${(performance.stocks.value / performance.total) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Crypto</span>
                  <span className="font-medium">
                    {((performance.crypto.value / performance.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary"
                    style={{ width: `${(performance.crypto.value / performance.total) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Real Estate</span>
                  <span className="font-medium">
                    {((performance.realEstate.value / performance.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${(performance.realEstate.value / performance.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};