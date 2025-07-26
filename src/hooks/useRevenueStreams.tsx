
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface RevenueStream {
  id: string;
  user_id: string;
  business_entity_id?: string;
  stream_name: string;
  stream_type: 'sales' | 'donations' | 'loans' | 'grants' | 'other';
  description?: string;
  target_amount?: number;
  actual_amount: number;
  period_start?: string;
  period_end?: string;
  is_active: boolean;
  currency_id?: string;
  created_at: string;
  updated_at?: string;
}

export const useRevenueStreams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: revenueStreams = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['revenue_streams'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('revenue_streams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RevenueStream[];
    },
    enabled: !!user,
  });

  const createRevenueStream = useMutation({
    mutationFn: async (newStream: Omit<RevenueStream, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('revenue_streams')
        .insert([{ ...newStream, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      toast({
        title: "Success",
        description: "Revenue stream created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create revenue stream",
        variant: "destructive",
      });
      console.error('Create revenue stream error:', error);
    },
  });

  const updateRevenueStream = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RevenueStream> & { id: string }) => {
      const { data, error } = await supabase
        .from('revenue_streams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      toast({
        title: "Success",
        description: "Revenue stream updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update revenue stream",
        variant: "destructive",
      });
    },
  });

  const deleteRevenueStream = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('revenue_streams')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
      toast({
        title: "Success",
        description: "Revenue stream deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete revenue stream",
        variant: "destructive",
      });
    },
  });

  return {
    revenueStreams,
    isLoading,
    error,
    createRevenueStream,
    updateRevenueStream,
    deleteRevenueStream,
  };
};
