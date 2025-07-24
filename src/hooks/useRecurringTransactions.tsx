
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface RecurringTransaction {
  id: string;
  user_id: string;
  template_data: any;
  frequency: string;
  next_run_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const useRecurringTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: recurringTransactions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['recurring_transactions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
    enabled: !!user,
  });

  const createRecurringTransaction = useMutation({
    mutationFn: async (newTransaction: Omit<RecurringTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert([{ ...newTransaction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({
        title: "Success",
        description: "Recurring transaction created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create recurring transaction",
        variant: "destructive",
      });
      console.error('Create recurring transaction error:', error);
    },
  });

  const updateRecurringTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringTransaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring_transactions'] });
      toast({
        title: "Success",
        description: "Recurring transaction updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recurring transaction",
        variant: "destructive",
      });
    },
  });

  return {
    recurringTransactions,
    isLoading,
    error,
    createRecurringTransaction,
    updateRecurringTransaction,
  };
};
