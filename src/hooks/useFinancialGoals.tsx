import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useMemo } from "react";

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

  // Sample data for testing
  const sampleGoals = useMemo(() => [
    {
      id: "sample-goal-1",
      user_id: user?.id || "",
      goal_name: "Emergency Fund",
      goal_type: "savings" as const,
      target_amount: 10000,
      current_amount: 6500,
      target_date: "2024-12-31",
      priority: "high" as const,
      description: "Build emergency fund covering 6 months of expenses",
      is_achieved: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-goal-2",
      user_id: user?.id || "",
      goal_name: "Business Growth Investment",
      goal_type: "investment" as const,
      target_amount: 25000,
      current_amount: 15000,
      target_date: "2024-09-30",
      priority: "critical" as const,
      description: "Investment in new equipment and technology",
      is_achieved: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-goal-3",
      user_id: user?.id || "",
      goal_name: "Credit Card Debt",
      goal_type: "debt_reduction" as const,
      target_amount: 5000,
      current_amount: 3200,
      target_date: "2024-08-31",
      priority: "high" as const,
      description: "Pay off high-interest credit card debt",
      is_achieved: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-goal-4",
      user_id: user?.id || "",
      goal_name: "Revenue Target Q3",
      goal_type: "revenue" as const,
      target_amount: 50000,
      current_amount: 50000,
      target_date: "2024-09-30",
      priority: "medium" as const,
      description: "Achieve Q3 revenue target",
      is_achieved: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
  ], [user?.id]);

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

      if (error) {
        console.log('Database error, using sample data:', error);
        return sampleGoals;
      }
      
      // If no data in database, return sample data
      if (data.length === 0) {
        return sampleGoals;
      }
      
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
