import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCryptoTransactions } from "@/hooks/useCryptoTransactions";
import { ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export const CryptoTransactionHistory = ({ walletId }: { walletId?: string }) => {
  const { transactions, isLoading } = useCryptoTransactions(walletId);
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your cryptocurrency transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Sync your wallet to see transactions.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {tx.transaction_type === 'send' ? (
                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                  )}
                  <div>
                    <div className="font-medium">
                      {tx.transaction_type === 'send' ? 'Sent' : 'Received'} {tx.token_symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {tx.transaction_hash}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${tx.transaction_type === 'send' ? 'text-destructive' : 'text-success'}`}>
                    {tx.transaction_type === 'send' ? '-' : '+'}{tx.value.toFixed(6)} {tx.token_symbol}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Gas: {tx.gas_fee.toFixed(6)}
                  </div>
                  <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'} className="mt-1">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
