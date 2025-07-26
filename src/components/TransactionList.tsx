
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Pencil, Trash2, Search, Filter, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "./TransactionForm";

interface TransactionListProps {
  transactions?: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const TransactionList = ({ 
  transactions: propTransactions, 
  onEdit, 
  onDelete, 
  showActions = true 
}: TransactionListProps) => {
  const { transactions: hookTransactions, deleteTransaction, isLoading } = useTransactions();
  const { formatCurrency } = useCurrencyFormatter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const transactions = propTransactions || hookTransactions;

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || transaction.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      await deleteTransaction.mutateAsync(id);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    if (onEdit) {
      onEdit(transaction);
    } else {
      setEditingTransaction(transaction);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            Recent Transactions
            <Badge variant="secondary">{transactions.length}</Badge>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Transaction</DialogTitle>
                </DialogHeader>
                <TransactionForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-4">
              {searchTerm || filterType !== "all" ? "No transactions match your filters" : "No transactions yet"}
            </div>
            {(!searchTerm && filterType === "all") && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg mb-3 hover:bg-accent/50 transition-colors">
                    <div className="flex-1 space-y-2 sm:space-y-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={transaction.type === 'income' ? 'default' : 'secondary'}
                            className={transaction.type === 'income' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}
                          >
                            {transaction.type === 'income' ? '↗' : '↙'} {transaction.type}
                          </Badge>
                          <span className="font-medium text-sm sm:text-base">
                            {transaction.description || 'No description'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {transaction.category && (
                            <span className="bg-muted px-2 py-1 rounded-md">
                              {transaction.category}
                            </span>
                          )}
                          {transaction.cost_center && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                              {transaction.cost_center}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(transaction.date).toLocaleDateString()}</span>
                        {transaction.notes && (
                          <span className="hidden sm:inline">• {transaction.notes}</span>
                        )}
                      </div>
                      
                      {transaction.notes && (
                        <div className="sm:hidden text-sm text-muted-foreground">
                          {transaction.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0">
                      <span className={`text-lg font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(
                          Math.abs(transaction.amount), 
                          transaction.currency_id,
                          undefined,
                          { showSymbol: true, decimals: 2 }
                        )}
                      </span>
                      
                      {showActions && (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this transaction? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(transaction.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {editingTransaction && (
          <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm 
                transaction={editingTransaction}
                onSuccess={() => setEditingTransaction(null)} 
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
