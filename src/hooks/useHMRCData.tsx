import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import type { HMRCTaxData, HMRCDataSync } from "@/types/hmrc";

export const useHMRCData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: taxData, isLoading: isLoadingData } = useQuery({
    queryKey: ['hmrc_tax_data', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('hmrc_tax_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HMRCTaxData[];
    },
    enabled: !!user,
  });

  const { data: syncHistory, isLoading: isLoadingSync } = useQuery({
    queryKey: ['hmrc_data_sync', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('hmrc_data_sync')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const syncData = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('hmrc-sync-data');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hmrc_tax_data'] });
      queryClient.invalidateQueries({ queryKey: ['hmrc_data_sync'] });
      toast({
        title: "Sync Complete",
        description: "Successfully synced data from HMRC",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const lastSync = syncHistory?.[0];

  return {
    taxData,
    syncHistory,
    lastSync,
    isLoading: isLoadingData || isLoadingSync,
    syncData,
    isSyncing: syncData.isPending,
  };
};
