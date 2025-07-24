
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface TaxPeriod {
  id: string;
  user_id: string;
  business_entity_id?: string;
  period_type: 'quarterly' | 'annual';
  tax_year: number;
  quarter?: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'filed' | 'extended' | 'closed';
  estimated_tax_due: number;
  actual_tax_due: number;
  amount_paid: number;
  created_at: string;
  updated_at: string;
}

export const useTaxPeriods = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: taxPeriods = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tax_periods'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tax_periods')
        .select('*')
        .eq('user_id', user.id)
        .order('tax_year', { ascending: false });

      if (error) throw error;
      return data as TaxPeriod[];
    },
    enabled: !!user,
  });

  const createTaxPeriod = useMutation({
    mutationFn: async (newPeriod: Omit<TaxPeriod, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_periods')
        .insert([{ ...newPeriod, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_periods'] });
      toast({
        title: "Success",
        description: "Tax period created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tax period",
        variant: "destructive",
      });
      console.error('Create tax period error:', error);
    },
  });

  const updateTaxPeriod = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxPeriod> & { id: string }) => {
      const { data, error } = await supabase
        .from('tax_periods')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_periods'] });
      toast({
        title: "Success",
        description: "Tax period updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tax period",
        variant: "destructive",
      });
    },
  });

  return {
    taxPeriods,
    isLoading,
    error,
    createTaxPeriod,
    updateTaxPeriod,
  };
};
