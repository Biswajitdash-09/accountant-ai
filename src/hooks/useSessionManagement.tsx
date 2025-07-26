
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  last_active: string;
  expires_at: string;
}

export const useSessionManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: sessions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['user_sessions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_active', { ascending: false });

      if (error) throw error;
      return data as UserSession[];
    },
    enabled: !!user,
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_sessions'] });
      toast({
        title: "Success",
        description: "Session revoked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      });
    },
  });

  const revokeAllSessions = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_sessions'] });
      toast({
        title: "Success",
        description: "All sessions revoked successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to revoke all sessions",
        variant: "destructive",
      });
    },
  });

  return {
    sessions,
    isLoading,
    error,
    revokeSession,
    revokeAllSessions,
  };
};
