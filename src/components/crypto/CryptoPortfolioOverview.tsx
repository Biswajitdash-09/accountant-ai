import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCryptoHoldings } from "@/hooks/useCryptoHoldings";
import { TrendingUp, Coins } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export const CryptoPortfolioOverview = ({ walletId }: { walletId?: string }) => {
  const { holdings, isLoading, totalValue } = useCryptoHoldings(walletId);
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading portfolio...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Value
          </CardTitle>
          <CardDescription>Total value of your crypto holdings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {holdings.length} {holdings.length === 1 ? 'token' : 'tokens'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Holdings
          </CardTitle>
          <CardDescription>Your cryptocurrency tokens</CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No holdings found. Sync your wallet to see your tokens.
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((holding: any) => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{holding.token_symbol}</div>
                    <div className="text-sm text-muted-foreground">{holding.token_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{holding.balance.toFixed(6)}</div>
                    {holding.value_usd > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(holding.value_usd)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
