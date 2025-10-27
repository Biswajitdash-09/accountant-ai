import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Investment {
  id: string;
  user_id: string;
  asset_type: 'stock' | 'crypto' | 'bond' | 'fund' | 'etf' | 'other';
  symbol: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  currency_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useInvestmentTracking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['investment_portfolio'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('investment_portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      return data as Investment[];
    },
  });

  const addInvestment = useMutation({
    mutationFn: async (investmentData: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('investment_portfolio')
        .insert([{ ...investmentData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_portfolio'] });
      toast({
        title: "Success",
        description: "Investment added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add investment.",
        variant: "destructive",
      });
    },
  });

  const updateInvestment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Investment> & { id: string }) => {
      const { data, error } = await supabase
        .from('investment_portfolio')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_portfolio'] });
      toast({
        title: "Success",
        description: "Investment updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update investment.",
        variant: "destructive",
      });
    },
  });

  const deleteInvestment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investment_portfolio')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_portfolio'] });
      toast({
        title: "Success",
        description: "Investment deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete investment.",
        variant: "destructive",
      });
    },
  });

  return {
    investments,
    isLoading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };
};