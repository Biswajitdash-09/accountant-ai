
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SecurityAuditLog {
  id: string;
  user_id: string;
  action_type: string;
  action_description: string;
  ip_address?: string;
  user_agent?: string;
  metadata: any;
  created_at: string;
}

export const useSecurityAuditLogs = () => {
  const { user } = useAuth();

  const {
    data: auditLogs = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['security_audit_logs'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SecurityAuditLog[];
    },
    enabled: !!user,
  });

  const logSecurityEvent = useMutation({
    mutationFn: async ({
      action_type,
      action_description,
      metadata = {}
    }: {
      action_type: string;
      action_description: string;
      metadata?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action_type: action_type,
        p_action_description: action_description,
        p_ip_address: null, // Could be populated from headers
        p_user_agent: navigator.userAgent,
        p_metadata: metadata
      });

      if (error) throw error;
    }
  });

  return {
    auditLogs,
    isLoading,
    error,
    logSecurityEvent,
  };
};
