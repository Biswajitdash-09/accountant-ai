
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface BudgetTemplate {
  id: string;
  user_id: string;
  business_entity_id?: string;
  template_name: string;
  template_type: 'personal' | 'family' | 'business' | 'project';
  income_categories: any[];
  expense_categories: any[];
  budget_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  total_income: number;
  total_expenses: number;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export const useBudgetTemplates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: budgetTemplates = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['budget_templates'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('budget_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BudgetTemplate[];
    },
    enabled: !!user,
  });

  const createBudgetTemplate = useMutation({
    mutationFn: async (newTemplate: Omit<BudgetTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budget_templates')
        .insert([{ ...newTemplate, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_templates'] });
      toast({
        title: "Success",
        description: "Budget template created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create budget template",
        variant: "destructive",
      });
      console.error('Create budget template error:', error);
    },
  });

  const updateBudgetTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BudgetTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('budget_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_templates'] });
      toast({
        title: "Success",
        description: "Budget template updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update budget template",
        variant: "destructive",
      });
    },
  });

  const deleteBudgetTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budget_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_templates'] });
      toast({
        title: "Success",
        description: "Budget template deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete budget template",
        variant: "destructive",
      });
    },
  });

  return {
    budgetTemplates,
    isLoading,
    error,
    createBudgetTemplate,
    updateBudgetTemplate,
    deleteBudgetTemplate,
  };
};
