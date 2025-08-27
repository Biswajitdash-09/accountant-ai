
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useUserPreferences } from "./useUserPreferences";
import { useCurrencies } from "./useCurrencies";
import { useDemoAwareData } from "./useDemoAwareData";

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string;
  amount: number;
  date: string;
  category?: string;
  subcategory?: string;
  type?: 'income' | 'expense';
  notes?: string;
  description?: string;
  revenue_stream_id?: string;
  cost_center?: string;
  is_recurring?: boolean;
  currency_id?: string;
  created_at: string;
  updated_at?: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { preferences } = useUserPreferences();
  const { baseCurrency } = useCurrencies();
  const { isDemo, showDemoSavePrompt, getTransactionsData } = useDemoAwareData();

  // Set up real-time subscription only for authenticated users
  useEffect(() => {
    if (!user || isDemo) return;

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, isDemo]);

  const {
    data: transactions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      // Return demo data if in demo mode
      if (isDemo) {
        return getTransactionsData();
      }

      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!(user || isDemo),
  });

  const createTransaction = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (isDemo) {
        showDemoSavePrompt();
        // Simulate success for demo
        return { id: `demo-${Date.now()}`, ...newTransaction, user_id: 'demo', created_at: new Date().toISOString() };
      }

      if (!user) throw new Error('User not authenticated');

      // Ensure currency_id is set
      const transactionData = {
        ...newTransaction,
        user_id: user.id,
        currency_id: newTransaction.currency_id || preferences?.default_currency_id || baseCurrency?.id
      };

      if (!transactionData.currency_id) {
        throw new Error('Currency ID is required');
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      }
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
    },
    onError: (error) => {
      if (!isDemo) {
        toast({
          title: "Error",
          description: "Failed to create transaction",
          variant: "destructive",
        });
        console.error('Create transaction error:', error);
      }
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      if (isDemo) {
        showDemoSavePrompt();
        return { id, ...updates };
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      }
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: () => {
      if (!isDemo) {
        toast({
          title: "Error",
          description: "Failed to update transaction",
          variant: "destructive",
        });
      }
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        showDemoSavePrompt();
        return;
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      }
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: () => {
      if (!isDemo) {
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive",
        });
      }
    },
  });

  return {
    transactions,
    isLoading: isDemo ? false : isLoading,
    error: isDemo ? null : error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
