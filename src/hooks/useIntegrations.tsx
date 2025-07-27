
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface IntegrationConnection {
  id: string;
  user_id: string;
  integration_type: string;
  connection_name: string;
  credentials: any;
  configuration: any;
  status: string;
  last_sync_at?: string;
  next_sync_at?: string;
  sync_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  integration_id: string;
  user_id: string;
  sync_type: string;
  status: string;
  records_processed: number;
  errors_count: number;
  sync_details: any;
  started_at: string;
  completed_at?: string;
}

export const useIntegrations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: connections = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['integration_connections'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IntegrationConnection[];
    },
    enabled: !!user,
  });

  const {
    data: syncLogs = [],
    isLoading: logsLoading
  } = useQuery({
    queryKey: ['sync_logs'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as SyncLog[];
    },
    enabled: !!user,
  });

  const createConnection = useMutation({
    mutationFn: async (connectionData: {
      integration_type: string;
      connection_name: string;
      credentials: any;
      configuration?: any;
      sync_frequency?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('integration_connections')
        .insert([{
          ...connectionData,
          user_id: user.id,
          status: 'inactive'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration_connections'] });
      toast({
        title: "Success",
        description: "Integration connection created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create integration connection.",
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Update status to testing
      const { error } = await supabase
        .from('integration_connections')
        .update({ status: 'testing' })
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Simulate test - in real app, this would call the actual API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update status to active
      const { data, error: updateError } = await supabase
        .from('integration_connections')
        .update({ status: 'active' })
        .eq('id', connectionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration_connections'] });
      toast({
        title: "Success",
        description: "Connection test successful.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Connection test failed.",
        variant: "destructive",
      });
    },
  });

  const syncData = useMutation({
    mutationFn: async (connectionId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sync_logs')
        .insert([{
          integration_id: connectionId,
          user_id: user.id,
          sync_type: 'manual',
          status: 'running'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync_logs'] });
      toast({
        title: "Success",
        description: "Data sync started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start data sync.",
        variant: "destructive",
      });
    },
  });

  return {
    connections,
    syncLogs,
    isLoading,
    logsLoading,
    error,
    createConnection,
    testConnection,
    syncData,
  };
};
