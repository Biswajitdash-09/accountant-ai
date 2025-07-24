
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface TaxSettings {
  id: string;
  user_id: string;
  business_entity_id?: string;
  tax_year_start: string;
  filing_status: string;
  business_type: string;
  tax_id_number?: string;
  state_tax_id?: string;
  quarterly_filing: boolean;
  auto_categorize_expenses: boolean;
  default_deduction_categories: string[];
  notification_preferences: any;
  created_at: string;
  updated_at: string;
}

export const useTaxSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: taxSettings,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tax_settings'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('tax_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TaxSettings | null;
    },
    enabled: !!user,
  });

  const createOrUpdateTaxSettings = useMutation({
    mutationFn: async (settings: Partial<TaxSettings>) => {
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await supabase
        .from('tax_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('tax_settings')
          .update(settings)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('tax_settings')
          .insert([{ ...settings, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_settings'] });
      toast({
        title: "Success",
        description: "Tax settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update tax settings",
        variant: "destructive",
      });
      console.error('Update tax settings error:', error);
    },
  });

  return {
    taxSettings,
    isLoading,
    error,
    createOrUpdateTaxSettings,
  };
};
