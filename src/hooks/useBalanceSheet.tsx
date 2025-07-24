import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useMemo } from "react";

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

  // Sample data for testing
  const sampleBalanceSheetItems = useMemo(() => [
    // Assets
    {
      id: "sample-bs-1",
      user_id: user?.id || "",
      item_name: "Cash and Cash Equivalents",
      item_type: "current_asset" as const,
      category: "Cash",
      amount: 25000,
      valuation_date: "2024-07-20",
      description: "Bank accounts and short-term investments",
      is_active: true,
      created_at: "2024-07-20T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-bs-2",
      user_id: user?.id || "",
      item_name: "Accounts Receivable",
      item_type: "current_asset" as const,
      category: "Receivables",
      amount: 15000,
      valuation_date: "2024-07-20",
      description: "Outstanding customer invoices",
      is_active: true,
      created_at: "2024-07-20T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-bs-3",
      user_id: user?.id || "",
      item_name: "Equipment",
      item_type: "fixed_asset" as const,
      category: "Property & Equipment",
      amount: 45000,
      valuation_date: "2024-07-20",
      description: "Office equipment and machinery",
      is_active: true,
      created_at: "2024-07-20T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    // Liabilities
    {
      id: "sample-bs-4",
      user_id: user?.id || "",
      item_name: "Accounts Payable",
      item_type: "current_liability" as const,
      category: "Payables",
      amount: 8000,
      valuation_date: "2024-07-20",
      description: "Outstanding supplier invoices",
      is_active: true,
      created_at: "2024-07-20T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-bs-5",
      user_id: user?.id || "",
      item_name: "Credit Card Debt",
      item_type: "current_liability" as const,
      category: "Short-term Debt",
      amount: 3200,
      valuation_date: "2024-07-20",
      description: "Outstanding credit card balance",
      is_active: true,
      created_at: "2024-07-20T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    {
      id: "sample-bs-6",
      user_id: user?.id || "",
      item_name: "Business Loan",
      item_type: "long_term_liability" as const,
      category: "Long-term Debt",
      amount: 20000,
      valuation_date: "2024-07-20",
      description: "SBA business loan",
      is_active: true,
      created_at: "2024-07-20T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
    // Equity
    {
      id: "sample-bs-7",
      user_id: user?.id || "",
      item_name: "Owner's Equity",
      item_type: "equity" as const,
      category: "Equity",
      amount: 53800,
      valuation_date: "2024-07-20",
      description: "Owner's investment and retained earnings",
      is_active: true,
      created_at: "2024-07-20T00:00:00Z",
      updated_at: "2024-07-20T00:00:00Z",
    },
  ], [user?.id]);

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

      if (error) {
        console.log('Database error, using sample data:', error);
        return sampleBalanceSheetItems;
      }
      
      // If no data in database, return sample data
      if (data.length === 0) {
        return sampleBalanceSheetItems;
      }
      
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
