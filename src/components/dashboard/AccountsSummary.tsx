
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAccounts } from "@/hooks/useAccounts";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { PlusCircle, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AccountForm from "../AccountForm";

const AccountsSummary = () => {
  const { accounts, isLoading } = useAccounts();
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Account Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const positiveBalanceAccounts = accounts.filter(account => (account.balance || 0) > 0);
  const negativeBalanceAccounts = accounts.filter(account => (account.balance || 0) < 0);

  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.account_type;
    if (!acc[type]) {
      acc[type] = { accounts: [], total: 0 };
    }
    acc[type].accounts.push(account);
    acc[type].total += account.balance || 0;
    return acc;
  }, {} as Record<string, { accounts: typeof accounts; total: number }>);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className={totalBalance >= 0 ? "text-green-600" : "text-red-600"}>
                {formatCurrency(totalBalance, undefined, undefined, { showSymbol: true, decimals: 2 })}
              </span>
              {totalBalance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Positive Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                positiveBalanceAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
                undefined,
                undefined,
                { showSymbol: true, decimals: 2 }
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {positiveBalanceAccounts.length} account{positiveBalanceAccounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Negative Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                negativeBalanceAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance || 0), 0),
                undefined,
                undefined,
                { showSymbol: true, decimals: 2 }
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {negativeBalanceAccounts.length} account{negativeBalanceAccounts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts by Type */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Accounts Overview</CardTitle>
              <CardDescription>Balances grouped by account type</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                </DialogHeader>
                <AccountForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No accounts yet</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                  </DialogHeader>
                  <AccountForm />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(accountsByType).map(([type, data]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize flex items-center gap-2">
                      {type.replace(/_/g, ' ')}
                      <Badge variant="secondary">{data.accounts.length}</Badge>
                    </h4>
                    <span className={`font-semibold ${data.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(data.total, undefined, undefined, { showSymbol: true, decimals: 2 })}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {data.accounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">{account.account_name}</div>
                          <div className="text-sm text-muted-foreground">{account.account_type}</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-semibold ${
                            (account.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(
                              account.balance || 0, 
                              account.currency_id,
                              undefined,
                              { showSymbol: true, decimals: 2 }
                            )}
                          </div>
                          
                          {totalBalance > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {((Math.abs(account.balance || 0) / Math.abs(totalBalance)) * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalBalance > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Type Distribution</span>
                        <span>{((Math.abs(data.total) / Math.abs(totalBalance)) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(Math.abs(data.total) / Math.abs(totalBalance)) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsSummary;
