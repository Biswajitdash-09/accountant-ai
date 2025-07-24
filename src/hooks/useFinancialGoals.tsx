
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface FinancialGoal {
  id: string;
  user_id: string;
  business_entity_id?: string;
  goal_name: string;
  goal_type: 'savings' | 'investment' | 'debt_reduction' | 'revenue' | 'expense_reduction';
  target_amount: number;
  current_amount: number;
  target_date?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  is_achieved: boolean;
  created_at: string;
  updated_at?: string;
}

export const useFinancialGoals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: financialGoals = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['financial_goals'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FinancialGoal[];
    },
    enabled: !!user,
  });

  const createFinancialGoal = useMutation({
    mutationFn: async (newGoal: Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('financial_goals')
        .insert([{ ...newGoal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_goals'] });
      toast({
        title: "Success",
        description: "Financial goal created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create financial goal",
        variant: "destructive",
      });
      console.error('Create financial goal error:', error);
    },
  });

  const updateFinancialGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FinancialGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_goals'] });
      toast({
        title: "Success",
        description: "Financial goal updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update financial goal",
        variant: "destructive",
      });
    },
  });

  const deleteFinancialGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_goals'] });
      toast({
        title: "Success",
        description: "Financial goal deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete financial goal",
        variant: "destructive",
      });
    },
  });

  return {
    financialGoals,
    isLoading,
    error,
    createFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
  };
};
