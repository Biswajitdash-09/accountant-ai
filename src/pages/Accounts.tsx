
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccounts } from "@/hooks/useAccounts";
import AddAccountModal from "@/components/modals/AddAccountModal";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import AccountDetailsModal from "@/components/modals/AccountDetailsModal";
import ImportStatementModal from "@/components/modals/ImportStatementModal";
import EditAccountModal from "@/components/modals/EditAccountModal";
import { CreditCard, Wallet, Building, Trash2, Edit, Eye, Loader2, Plus, Upload } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

const Accounts = () => {
  const { accounts, isLoading, deleteAccount } = useAccounts();

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return <Wallet className="h-5 w-5" />;
      case 'savings':
        return <Building className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'savings':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'credit':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const { formatCurrency } = useCurrencyFormatter();

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccount.mutateAsync(accountId);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts and balances
          </p>
        </div>
        <AddAccountModal 
          trigger={
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          }
        />
      </div>

      {accounts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first financial account
            </p>
            <AddAccountModal 
              trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getAccountIcon(account.account_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.account_name}</CardTitle>
                      <Badge className={getAccountTypeColor(account.account_type)} variant="outline">
                        {account.account_type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <AccountDetailsModal
                    account={account}
                    trigger={
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    }
                  />
                  <ImportStatementModal
                    account={account}
                    trigger={
                      <Button variant="outline" size="sm" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    }
                  />
                </div>

                <AddTransactionModal 
                  trigger={
                    <Button size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  }
                />

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <EditAccountModal
                    account={account}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{account.account_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteAccount(account.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accounts;
