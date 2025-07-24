
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
    mutationFn: async (updates: Partial<UserPreferences>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert([{ user_id: user.id, ...updates }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences'] });
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    },
    onError: () => {
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
