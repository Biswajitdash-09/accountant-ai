
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
  current_plan_id: string | null;
  currency_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
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
    queryKey: ['user_credits', user?.id],
    queryFn: async (): Promise<UserCredits | null> => {
      if (!user) {
        console.log('No user found for credits query');
        return null;
      }
      
      console.log('Fetching credits for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No credits record found, let's create one
          console.log('No credits record found, creating initial record');
          const { data: newRecord, error: insertError } = await supabase
            .from('user_credits')
            .insert({
              user_id: user.id,
              total_credits: 5,
              used_credits: 0,
              daily_free_credits: 5,
              subscription_tier: 'free',
              current_plan_id: 'free'
            })
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating initial credits record:', insertError);
            throw insertError;
          }
          
          console.log('Created initial credits record:', newRecord);
          return newRecord as UserCredits;
        }
        console.error('Error fetching credits:', error);
        throw error;
      }
      
      console.log('Credits fetched successfully:', data);
      return data as UserCredits;
    },
    enabled: !!user,
    retry: 1,
  });

  const useCredit = useMutation({
    mutationFn: async (amount: number = 1) => {
      if (!user) {
        console.error('No user authenticated for credit usage');
        throw new Error('User not authenticated');
      }

      console.log(`Attempting to use ${amount} credits for user:`, user.id);

      const { data, error } = await supabase
        .rpc('use_credits', { 
          user_id: user.id,
          credits_to_use: amount
        });

      if (error) {
        console.error('Error using credits:', error);
        throw error;
      }

      if (!data) {
        console.error('Insufficient credits for operation');
        throw new Error('Insufficient credits');
      }

      console.log('Credits used successfully');
      return data;
    },
    onSuccess: () => {
      console.log('Credit usage successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['user_credits'] });
    },
    onError: (error) => {
      console.error('Credit usage failed:', error);
      toast({
        title: "Error",
        description: error.message === 'Insufficient credits' 
          ? "Not enough credits available. Please purchase more credits."
          : "Failed to use credits. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addCredits = useMutation({
    mutationFn: async (amount: number) => {
      if (!user) {
        console.error('No user authenticated for adding credits');
        throw new Error('User not authenticated');
      }

      console.log(`Adding ${amount} credits for user:`, user.id);

      const { data, error } = await supabase
        .rpc('add_credits', {
          user_id: user.id,
          credits_to_add: amount
        });

      if (error) {
        console.error('Error adding credits:', error);
        throw error;
      }

      console.log('Credits added successfully');
      return data;
    },
    onSuccess: (data, amount) => {
      console.log('Credit addition successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['user_credits'] });
      toast({
        title: "Success",
        description: `${amount} credits added successfully!`,
      });
    },
    onError: (error) => {
      console.error('Failed to add credits:', error);
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

      console.log('Resetting daily credits for user:', user.id);

      const { data, error } = await supabase
        .rpc('reset_daily_credits', { user_id: user.id });

      if (error) {
        console.error('Error resetting daily credits:', error);
        throw error;
      }

      console.log('Daily credits reset successfully');
      return data;
    },
    onSuccess: () => {
      console.log('Daily credit reset successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['user_credits'] });
    },
  });

  const availableCredits = credits ? credits.total_credits - credits.used_credits : 0;
  const dailyCreditsRemaining = credits ? Math.max(0, credits.daily_free_credits - credits.used_credits) : 0;

  // Log current credit state for debugging
  console.log('Current credit state:', {
    credits,
    availableCredits,
    dailyCreditsRemaining,
    isLoading,
    error: error?.message
  });

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
