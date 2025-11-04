import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCryptoHoldings } from "@/hooks/useCryptoHoldings";
import { useCryptoWallets } from "@/hooks/useCryptoWallets";
import { TrendingUp, PieChart, Target, AlertCircle } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Progress } from "@/components/ui/progress";

export const CryptoAnalyticsDashboard = () => {
  const { wallets } = useCryptoWallets();
  const { holdings, totalValue } = useCryptoHoldings();
  const { formatCurrency } = useCurrencyFormatter();

  // Calculate portfolio metrics
  const tokenCount = holdings.length;
  const topHolding = holdings.length > 0 ? holdings[0] : null;
  const topHoldingValue = topHolding ? Number(topHolding.value_usd) : 0;
  const concentrationPercentage = topHolding && totalValue > 0 
    ? (topHoldingValue / totalValue) * 100
    : 0;
  const portfolioConcentration = concentrationPercentage.toFixed(1);

  // Risk analysis (simplified)
  const riskLevel = concentrationPercentage > 50 ? 'High' : concentrationPercentage > 30 ? 'Medium' : 'Low';
  const riskColor = riskLevel === 'High' ? 'text-destructive' : riskLevel === 'Medium' ? 'text-yellow-500' : 'text-success';

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Across {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenCount}</div>
            <p className="text-xs text-muted-foreground">
              Unique crypto assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Holding</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topHolding?.token_symbol || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {portfolioConcentration}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertCircle className={`h-4 w-4 ${riskColor}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</div>
            <p className="text-xs text-muted-foreground">
              Portfolio concentration
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
          <CardDescription>Distribution of your crypto assets</CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No holdings to display. Connect and sync your wallet.
            </div>
          ) : (
            <div className="space-y-4">
              {holdings.slice(0, 10).map((holding: any) => {
                const percentage = totalValue > 0 ? (holding.value_usd / totalValue) * 100 : 0;
                return (
                  <div key={holding.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{holding.token_symbol}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(holding.value_usd)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
