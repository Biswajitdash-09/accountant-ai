
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface TaxDeduction {
  id: string;
  user_id: string;
  business_entity_id?: string;
  tax_period_id: string;
  transaction_id?: string;
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  currency_id?: string;
  deduction_type: 'business_expense' | 'home_office' | 'travel' | 'meals' | 'equipment' | 'professional_services' | 'other';
  is_approved: boolean;
  supporting_documents: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useTaxDeductions = (taxPeriodId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: taxDeductions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tax_deductions', taxPeriodId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('tax_deductions')
        .select('*')
        .eq('user_id', user.id);

      if (taxPeriodId) {
        query = query.eq('tax_period_id', taxPeriodId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaxDeduction[];
    },
    enabled: !!user,
  });

  const createTaxDeduction = useMutation({
    mutationFn: async (newDeduction: Omit<TaxDeduction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_deductions')
        .insert([{ ...newDeduction, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_deductions'] });
      toast({
        title: "Success",
        description: "Tax deduction created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tax deduction",
        variant: "destructive",
      });
      console.error('Create tax deduction error:', error);
    },
  });

  const updateTaxDeduction = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxDeduction> & { id: string }) => {
      const { data, error } = await supabase
        .from('tax_deductions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_deductions'] });
      toast({
        title: "Success",
        description: "Tax deduction updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tax deduction",
        variant: "destructive",
      });
    },
  });

  const deleteTaxDeduction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tax_deductions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_deductions'] });
      toast({
        title: "Success",
        description: "Tax deduction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tax deduction",
        variant: "destructive",
      });
    },
  });

  return {
    taxDeductions,
    isLoading,
    error,
    createTaxDeduction,
    updateTaxDeduction,
    deleteTaxDeduction,
  };
};
