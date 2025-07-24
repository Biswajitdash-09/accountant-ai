
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useMemo } from "react";

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
  created_at: string;
  updated_at?: string;
}

export const useRevenueStreams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sample data for testing
  const sampleRevenueStreams = useMemo(() => [
    {
      id: "sample-1",
      user_id: user?.id || "",
      stream_name: "E-commerce Sales",
      stream_type: "sales" as const,
      description: "Online product sales",
      target_amount: 50000,
      actual_amount: 42500,
      period_start: "2024-01-01",
      period_end: "2024-12-31",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "sample-2",
      user_id: user?.id || "",
      stream_name: "Consulting Services",
      stream_type: "sales" as const,
      description: "Business consulting revenue",
      target_amount: 30000,
      actual_amount: 28750,
      period_start: "2024-01-01",
      period_end: "2024-12-31",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "sample-3",
      user_id: user?.id || "",
      stream_name: "Grant Funding",
      stream_type: "grants" as const,
      description: "Government business grant",
      target_amount: 15000,
      actual_amount: 15000,
      period_start: "2024-01-01",
      period_end: "2024-12-31",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "sample-4",
      user_id: user?.id || "",
      stream_name: "Subscription Revenue",
      stream_type: "sales" as const,
      description: "Monthly subscription fees",
      target_amount: 25000,
      actual_amount: 22100,
      period_start: "2024-01-01",
      period_end: "2024-12-31",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    },
  ], [user?.id]);

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

      if (error) {
        console.log('Database error, using sample data:', error);
        return sampleRevenueStreams;
      }
      
      // If no data in database, return sample data
      if (data.length === 0) {
        return sampleRevenueStreams;
      }
      
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
