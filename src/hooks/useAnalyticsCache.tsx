
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  const queryClient = useQueryClient();

  const getCachedData = useQuery({
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

  const setCachedData = useMutation({
    mutationFn: async ({ cache_key, data, expires_at }: { cache_key: string; data: any; expires_at: string }) => {
      if (!user) throw new Error('User not authenticated');

      // First, delete any existing cache with the same key
      await supabase
        .from('analytics_cache')
        .delete()
        .eq('user_id', user.id)
        .eq('cache_key', cache_key);

      // Then insert the new cache
      const { data: result, error } = await supabase
        .from('analytics_cache')
        .insert([{ 
          user_id: user.id, 
          cache_key, 
          data, 
          expires_at 
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics_cache'] });
    },
  });

  const getCacheByKey = (key: string) => {
    const cached = getCachedData.data?.find(item => item.cache_key === key);
    if (cached && new Date(cached.expires_at) > new Date()) {
      return cached.data;
    }
    return null;
  };

  return {
    getCachedData: getCachedData.data,
    setCachedData,
    getCacheByKey,
    isLoading: getCachedData.isLoading,
  };
};
