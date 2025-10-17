import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import type { HMRCConnection } from "@/types/hmrc";

export const useHMRCConnection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connection, isLoading } = useQuery({
    queryKey: ['hmrc_connection', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('hmrc_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const initiateConnection = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('hmrc-auth-init');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectHMRC = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('hmrc-disconnect');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hmrc_connection'] });
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from HMRC",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    connection,
    isLoading,
    isConnected: connection?.connection_status === 'active',
    initiateConnection,
    disconnectHMRC,
  };
};
