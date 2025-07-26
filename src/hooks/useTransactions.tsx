import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useMemo } from "react";
import { useUserPreferences } from "./useUserPreferences";
import { useCurrencies } from "./useCurrencies";

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

  // Sample data for testing
  const sampleTransactions = useMemo(() => [
    {
      id: "sample-tx-1",
      user_id: user?.id || "",
      account_id: "sample-acc-1",
      amount: 2500,
      date: "2024-07-20",
      category: "Income",
      subcategory: "Sales",
      type: "income" as const,
      description: "E-commerce sales revenue",
      notes: "Monthly sales from online store",
      revenue_stream_id: "sample-rs-1",
      cost_center: "Sales Department",
      is_recurring: false,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-20T10:00:00Z",
      updated_at: "2024-07-20T10:00:00Z",
    },
    {
      id: "sample-tx-2",
      user_id: user?.id || "",
      account_id: "sample-acc-2",
      amount: 1200,
      date: "2024-07-19",
      category: "Rent",
      subcategory: "Office",
      type: "expense" as const,
      description: "Monthly office rent",
      notes: "Rent payment for Q3 2024",
      cost_center: "Operations",
      is_recurring: true,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-19T09:00:00Z",
      updated_at: "2024-07-19T09:00:00Z",
    },
    {
      id: "sample-tx-3",
      user_id: user?.id || "",
      account_id: "sample-acc-1",
      amount: 450,
      date: "2024-07-18",
      category: "Software",
      subcategory: "Subscriptions",
      type: "expense" as const,
      description: "Software licenses and subscriptions",
      notes: "Adobe Creative Suite, Microsoft Office",
      cost_center: "IT Department",
      is_recurring: true,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-18T14:00:00Z",
      updated_at: "2024-07-18T14:00:00Z",
    },
    {
      id: "sample-tx-4",
      user_id: user?.id || "",
      account_id: "sample-acc-3",
      amount: 3500,
      date: "2024-07-15",
      category: "Income",
      subcategory: "Consulting",
      type: "income" as const,
      description: "Business consulting services",
      notes: "Strategic consulting for ABC Corp",
      revenue_stream_id: "sample-rs-2",
      cost_center: "Consulting",
      is_recurring: false,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-15T11:00:00Z",
      updated_at: "2024-07-15T11:00:00Z",
    },
    {
      id: "sample-tx-5",
      user_id: user?.id || "",
      account_id: "sample-acc-2",
      amount: 175,
      date: "2024-07-12",
      category: "Utilities",
      subcategory: "Electric",
      type: "expense" as const,
      description: "Monthly electricity bill",
      notes: "Office electricity usage",
      cost_center: "Operations",
      is_recurring: true,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-12T16:00:00Z",
      updated_at: "2024-07-12T16:00:00Z",
    },
    {
      id: "sample-tx-6",
      user_id: user?.id || "",
      account_id: "sample-acc-1",
      amount: 850,
      date: "2024-07-10",
      category: "Marketing",
      subcategory: "Advertising",
      type: "expense" as const,
      description: "Digital marketing campaign",
      notes: "Google Ads and Facebook advertising",
      cost_center: "Marketing",
      is_recurring: false,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-10T12:00:00Z",
      updated_at: "2024-07-10T12:00:00Z",
    },
    {
      id: "sample-tx-7",
      user_id: user?.id || "",
      account_id: "sample-acc-3",
      amount: 320,
      date: "2024-07-08",
      category: "Travel",
      subcategory: "Business",
      type: "expense" as const,
      description: "Business travel expenses",
      notes: "Flight and hotel for client meeting",
      cost_center: "Sales Department",
      is_recurring: false,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-08T13:00:00Z",
      updated_at: "2024-07-08T13:00:00Z",
    },
    {
      id: "sample-tx-8",
      user_id: user?.id || "",
      account_id: "sample-acc-1",
      amount: 1800,
      date: "2024-07-05",
      category: "Income",
      subcategory: "Sales",
      type: "income" as const,
      description: "Product sales",
      notes: "Physical product sales for July",
      revenue_stream_id: "sample-rs-1",
      cost_center: "Sales Department",
      is_recurring: false,
      currency_id: preferences?.default_currency_id || baseCurrency?.id || "",
      created_at: "2024-07-05T15:00:00Z",
      updated_at: "2024-07-05T15:00:00Z",
    },
  ], [user?.id, preferences?.default_currency_id, baseCurrency?.id]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

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
  }, [user, queryClient]);

  const {
    data: transactions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.log('Database error, using sample data:', error);
        return sampleTransactions;
      }
      
      // If no data in database, return sample data
      if (data.length === 0) {
        return sampleTransactions;
      }
      
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const createTransaction = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create transaction",
        variant: "destructive",
      });
      console.error('Create transaction error:', error);
    },
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
