import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CostCenter {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  budget_allocation?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCostCenters = (entityId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: costCenters = [], isLoading } = useQuery({
    queryKey: ['cost_centers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CostCenter[];
    },
  });

  const addCostCenter = useMutation({
    mutationFn: async (centerData: Omit<CostCenter, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cost_centers')
        .insert([{ ...centerData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_centers'] });
      toast({
        title: "Success",
        description: "Cost center created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create cost center.",
        variant: "destructive",
      });
    },
  });

  const updateCostCenter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CostCenter> & { id: string }) => {
      const { data, error } = await supabase
        .from('cost_centers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_centers'] });
      toast({
        title: "Success",
        description: "Cost center updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cost center.",
        variant: "destructive",
      });
    },
  });

  const deleteCostCenter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cost_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_centers'] });
      toast({
        title: "Success",
        description: "Cost center deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete cost center.",
        variant: "destructive",
      });
    },
  });

  return {
    costCenters,
    isLoading,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
  };
};
