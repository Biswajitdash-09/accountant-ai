
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface AnalyticsCache {
  id: string;
  user_id: string;
  cache_key: string;
  data: any;
  expires_at: string;
  created_at: string;
}

export const useAnalyticsCache = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: cacheEntries = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['analytics_cache'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('analytics_cache')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AnalyticsCache[];
    },
    enabled: !!user,
  });

  const getCacheByKey = (key: string) => {
    const entry = cacheEntries.find(entry => entry.cache_key === key);
    if (entry && new Date(entry.expires_at) > new Date()) {
      return entry.data;
    }
    return null;
  };

  const setCachedData = useMutation({
    mutationFn: async (params: { cache_key: string; data: any; expires_at: string }) => {
      if (!user) throw new Error('User not authenticated');

      // First, try to update existing cache entry
      const { data: existingData, error: selectError } = await supabase
        .from('analytics_cache')
        .select('id')
        .eq('user_id', user.id)
        .eq('cache_key', params.cache_key)
        .single();

      if (existingData) {
        // Update existing entry
        const { data, error } = await supabase
          .from('analytics_cache')
          .update({
            data: params.data,
            expires_at: params.expires_at
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new entry
        const { data, error } = await supabase
          .from('analytics_cache')
          .insert([{
            user_id: user.id,
            cache_key: params.cache_key,
            data: params.data,
            expires_at: params.expires_at
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics_cache'] });
    },
    onError: (error) => {
      console.error('Cache error:', error);
      // Don't show toast for cache errors as they're not critical
    },
  });

  const clearExpiredCache = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('analytics_cache')
        .delete()
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics_cache'] });
    },
  });

  return {
    cacheEntries,
    isLoading,
    error,
    getCacheByKey,
    setCachedData,
    clearExpiredCache,
  };
};
