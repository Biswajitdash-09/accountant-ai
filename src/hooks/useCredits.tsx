
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface UserCredits {
  id: string;
  user_id: string;
  total_credits: number;
  used_credits: number;
  daily_free_credits: number;
  last_reset_date: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export const useCredits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: credits,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user_credits'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const useCredit = useMutation({
    mutationFn: async (amount: number = 1) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('use_credits', { 
          user_id: user.id,
          credits_to_use: amount
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_credits'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to use credits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addCredits = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('add_credits', {
          user_id: user.id,
          credits_to_add: amount
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_credits'] });
      toast({
        title: "Success",
        description: "Credits added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add credits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetDailyCredits = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('reset_daily_credits', { user_id: user.id });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_credits'] });
    },
  });

  const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;
  const dailyCreditsRemaining = credits ? Math.max(0, credits.daily_free_credits - credits.used_credits) : 0;

  return {
    credits,
    availableCredits,
    dailyCreditsRemaining,
    isLoading,
    error,
    useCredit,
    addCredits,
    resetDailyCredits,
  };
};
