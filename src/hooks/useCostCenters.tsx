
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface CostCenter {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  budget_allocation: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCostCenters = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: costCenters = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['cost_centers'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CostCenter[];
    },
    enabled: !!user,
  });

  const createCostCenter = useMutation({
    mutationFn: async (newCostCenter: Omit<CostCenter, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cost_centers')
        .insert([{ ...newCostCenter, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_centers'] });
      toast({
        title: "Success",
        description: "Cost center created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create cost center",
        variant: "destructive",
      });
      console.error('Create cost center error:', error);
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
        description: "Cost center updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cost center",
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
        description: "Cost center deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete cost center",
        variant: "destructive",
      });
    },
  });

  return {
    costCenters,
    isLoading,
    error,
    createCostCenter,
    updateCostCenter,
    deleteCostCenter,
  };
};
