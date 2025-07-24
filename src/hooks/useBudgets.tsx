import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface Budget {
  id: string;
  user_id: string;
  name: string;
  budget_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  total_budget: number;
  actual_spent: number;
  categories: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBudgets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample data for testing
  const sampleBudgets = useMemo(() => [
    {
      id: "sample-budget-1",
      user_id: user?.id || "",
      name: "Monthly Operating Budget",
      budget_period: "monthly" as const,
      start_date: "2024-07-01",
      end_date: "2024-07-31",
      total_budget: 5000,
      actual_spent: 3750,
      categories: [
        { name: "Marketing", allocated: 1500, spent: 1200 },
        { name: "Operations", allocated: 2000, spent: 1800 },
        { name: "Software", allocated: 1000, spent: 450 },
        { name: "Travel", allocated: 500, spent: 300 }
      ],
      is_active: true,
      created_at: "2024-07-01T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-budget-2",
      user_id: user?.id || "",
      name: "Q3 Marketing Budget",
      budget_period: "quarterly" as const,
      start_date: "2024-07-01",
      end_date: "2024-09-30",
      total_budget: 15000,
      actual_spent: 8500,
      categories: [
        { name: "Digital Advertising", allocated: 8000, spent: 5200 },
        { name: "Content Creation", allocated: 4000, spent: 2100 },
        { name: "Events", allocated: 3000, spent: 1200 }
      ],
      is_active: true,
      created_at: "2024-07-01T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
  ], [user?.id]);

  const {
    data: budgets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Database error, using sample data:', error);
        return sampleBudgets;
      }
      
      // If no data in database, return sample data
      if (data.length === 0) {
        return sampleBudgets;
      }
      
      return data as Budget[];
    },
    enabled: !!user,
  });

  const createBudget = useMutation({
    mutationFn: async (newBudget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...newBudget, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create budget",
        variant: "destructive",
      });
      console.error('Create budget error:', error);
    },
  });

  const updateBudget = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    },
  });

  const deleteBudget = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    },
  });

  return {
    budgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
  };
};
