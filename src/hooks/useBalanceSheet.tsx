
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface BalanceSheetItem {
  id: string;
  user_id: string;
  business_entity_id?: string;
  item_name: string;
  item_type: 'current_asset' | 'fixed_asset' | 'current_liability' | 'long_term_liability' | 'equity';
  category: string;
  amount: number;
  valuation_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export const useBalanceSheet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: balanceSheetItems = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['balance_sheet_items'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('balance_sheet_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BalanceSheetItem[];
    },
    enabled: !!user,
  });

  const createBalanceSheetItem = useMutation({
    mutationFn: async (newItem: Omit<BalanceSheetItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('balance_sheet_items')
        .insert([{ ...newItem, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance_sheet_items'] });
      toast({
        title: "Success",
        description: "Balance sheet item created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create balance sheet item",
        variant: "destructive",
      });
      console.error('Create balance sheet item error:', error);
    },
  });

  const updateBalanceSheetItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BalanceSheetItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('balance_sheet_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance_sheet_items'] });
      toast({
        title: "Success",
        description: "Balance sheet item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update balance sheet item",
        variant: "destructive",
      });
    },
  });

  const deleteBalanceSheetItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('balance_sheet_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance_sheet_items'] });
      toast({
        title: "Success",
        description: "Balance sheet item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete balance sheet item",
        variant: "destructive",
      });
    },
  });

  return {
    balanceSheetItems,
    isLoading,
    error,
    createBalanceSheetItem,
    updateBalanceSheetItem,
    deleteBalanceSheetItem,
  };
};
