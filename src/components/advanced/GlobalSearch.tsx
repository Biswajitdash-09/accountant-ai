import { useState, useEffect, useMemo } from 'react';
import { Search, X, FileText, CreditCard, Target, DollarSign, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useFinancialGoals } from '@/hooks/useFinancialGoals';
import { useDocuments } from '@/hooks/useDocuments';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'transaction' | 'account' | 'goal' | 'document' | 'chat';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  action: () => void;
  metadata?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { financialGoals: goals } = useFinancialGoals();
  const { documents } = useDocuments();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search transactions
    transactions?.forEach((transaction) => {
      const matchesDescription = transaction.description?.toLowerCase().includes(searchTerm);
      const matchesAmount = transaction.amount.toString().includes(searchTerm);
      const matchesCategory = transaction.category?.toLowerCase().includes(searchTerm);
      
      if (matchesDescription || matchesAmount || matchesCategory) {
        results.push({
          id: transaction.id,
          type: 'transaction',
          title: transaction.description || 'Unnamed Transaction',
          subtitle: `$${transaction.amount.toFixed(2)} • ${transaction.category || 'Uncategorized'}`,
          icon: <CreditCard className="h-4 w-4" />,
          metadata: new Date(transaction.date).toLocaleDateString(),
          action: () => {
            navigate('/transactions');
            onClose();
          }
        });
      }
    });

    // Search accounts
    accounts?.forEach((account) => {
      const matchesName = account.account_name.toLowerCase().includes(searchTerm);
      const matchesType = account.account_type?.toLowerCase().includes(searchTerm);
      
      if (matchesName || matchesType) {
        results.push({
          id: account.id,
          type: 'account',
          title: account.account_name,
          subtitle: `${account.account_type} • Balance: $${(account.balance || 0).toFixed(2)}`,
          icon: <DollarSign className="h-4 w-4" />,
          action: () => {
            navigate('/accounts');
            onClose();
          }
        });
      }
    });

    // Search financial goals
    goals?.forEach((goal) => {
      const matchesName = goal.goal_name.toLowerCase().includes(searchTerm);
      const matchesDescription = goal.description?.toLowerCase().includes(searchTerm);
      
      if (matchesName || matchesDescription) {
        const progress = ((goal.current_amount / goal.target_amount) * 100).toFixed(0);
        results.push({
          id: goal.id,
          type: 'goal',
          title: goal.goal_name,
          subtitle: `$${goal.current_amount.toFixed(2)} / $${goal.target_amount.toFixed(2)} (${progress}%)`,
          icon: <Target className="h-4 w-4" />,
          metadata: goal.target_date ? new Date(goal.target_date).toLocaleDateString() : undefined,
          action: () => {
            navigate('/dashboard');
            onClose();
          }
        });
      }
    });

    // Search documents
    documents?.forEach((doc) => {
      const matchesName = doc.file_name?.toLowerCase().includes(searchTerm);
      const matchesType = doc.file_type?.toLowerCase().includes(searchTerm);
      const matchesCategory = doc.category?.toLowerCase().includes(searchTerm);
      
      if (matchesName || matchesType || matchesCategory) {
        results.push({
          id: doc.id,
          type: 'document',
          title: doc.file_name || 'Unnamed Document',
          subtitle: doc.category || doc.file_type || 'Document',
          icon: <FileText className="h-4 w-4" />,
          metadata: new Date(doc.created_at).toLocaleDateString(),
          action: () => {
            navigate('/upload');
            onClose();
          }
        });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [query, transactions, accounts, goals, documents, navigate, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          searchResults[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'transaction': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'account': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'goal': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'document': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions, accounts, goals, documents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10 h-12 text-base"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {query && searchResults.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="p-3">
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    index === selectedIndex
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  )}
                  onClick={result.action}
                >
                  <div className="flex-shrink-0">
                    {result.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {result.title}
                      </p>
                      <Badge variant="secondary" className={cn("text-xs", getTypeColor(result.type))}>
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  </div>

                  {result.metadata && (
                    <div className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {result.metadata}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span>{searchResults.length} results</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};