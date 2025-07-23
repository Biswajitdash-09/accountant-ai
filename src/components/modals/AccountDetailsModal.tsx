
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, ArrowUpDown, Upload, Edit, Trash2 } from "lucide-react";
import ImportStatementModal from "./ImportStatementModal";
import EditAccountModal from "./EditAccountModal";

interface AccountDetailsModalProps {
  account: Account;
  trigger: React.ReactNode;
}

const AccountDetailsModal = ({ account, trigger }: AccountDetailsModalProps) => {
  const [open, setOpen] = useState(false);
  const { transactions } = useTransactions();
  const { deleteAccount } = useAccounts();

  // Filter transactions for this account
  const accountTransactions = transactions.filter(t => t.account_id === account.id);

  // Calculate recent activity
  const recentTransactions = accountTransactions.slice(0, 10);
  const totalIncome = accountTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = accountTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync(account.id);
      setOpen(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{account.account_name}</span>
            <div className="flex items-center space-x-2">
              <EditAccountModal 
                account={account}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
              <ImportStatementModal 
                account={account}
                trigger={
                  <Button variant="ghost" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                }
              />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDeleteAccount}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                <Badge variant="outline" className="mt-2">
                  {account.account_type}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for detailed view */}
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
              <TabsTrigger value="activity">Account Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Last {recentTransactions.length} transactions for this account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getTransactionIcon(transaction.type || 'expense')}
                            <div>
                              <div className="font-medium">{transaction.description || 'Transaction'}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(transaction.date), 'MMM d, yyyy')}
                                {transaction.category && ` • ${transaction.category}`}
                              </div>
                            </div>
                          </div>
                          <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Activity Summary</CardTitle>
                  <CardDescription>
                    Overview of account activity and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Transactions</span>
                      <span className="text-sm">{accountTransactions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Income Transactions</span>
                      <span className="text-sm text-green-600">
                        {accountTransactions.filter(t => t.type === 'income').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expense Transactions</span>
                      <span className="text-sm text-red-600">
                        {accountTransactions.filter(t => t.type === 'expense').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Transaction</span>
                      <span className="text-sm">
                        {accountTransactions.length > 0 
                          ? formatCurrency(accountTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / accountTransactions.length)
                          : formatCurrency(0)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Account Created</span>
                      <span className="text-sm">{format(new Date(account.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountDetailsModal;
