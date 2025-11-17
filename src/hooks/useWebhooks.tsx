import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Webhook {
  id: string;
  user_id: string;
  api_key_id?: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  status: string;
  http_status?: number;
  response_body?: string;
  error_message?: string;
  attempts: number;
  delivered_at?: string;
  created_at: string;
}

export const useWebhooks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: webhooks = [],
    isLoading: webhooksLoading,
  } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Webhook[];
    },
    enabled: !!user,
  });

  const {
    data: deliveries = [],
    isLoading: deliveriesLoading,
  } = useQuery({
    queryKey: ['webhook_deliveries'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('webhook_deliveries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as WebhookDelivery[];
    },
    enabled: !!user,
  });

  const createWebhook = useMutation({
    mutationFn: async (webhook: {
      url: string;
      events: string[];
      api_key_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Generate a random secret for HMAC signature
      const secret = crypto.randomUUID();

      const { data, error } = await supabase
        .from('webhooks')
        .insert([{
          user_id: user.id,
          url: webhook.url,
          events: webhook.events,
          api_key_id: webhook.api_key_id,
          secret: secret,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: "Success",
        description: "Webhook created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
    },
  });

  const updateWebhook = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Webhook> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: "Success",
        description: "Webhook updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
    },
  });

  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: "Success",
        description: "Webhook deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
    },
  });

  const testWebhook = useMutation({
    mutationFn: async (webhookId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('webhook-test', {
        body: { webhook_id: webhookId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook_deliveries'] });
      toast({
        title: "Success",
        description: "Test webhook sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    },
  });

  return {
    webhooks,
    deliveries,
    webhooksLoading,
    deliveriesLoading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  };
};
