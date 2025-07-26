
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface UserPreferences {
  id: string;
  user_id: string;
  default_currency_id?: string;
  timezone: string;
  date_format: string;
  fiscal_year_start: string;
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    tax_reminders: boolean;
    goal_updates: boolean;
    security_alerts: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: preferences,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user_preferences'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserPreferences | null;
    },
    enabled: !!user,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user) throw new Error('User not authenticated');

      // First try to update existing preferences
      const { data: existingData, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingData) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('user_preferences')
          .insert([{ user_id: user.id, ...updates }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences'] });
      
      // If currency was changed, invalidate all financial data
      if (data && 'default_currency_id' in data) {
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: ['revenue_streams'] });
        queryClient.invalidateQueries({ queryKey: ['financial_goals'] });
        queryClient.invalidateQueries({ queryKey: ['balance_sheet_items'] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      }
      
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update preferences error:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
  };
};
