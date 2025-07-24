
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useAuditLogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: auditLogs = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['audit_logs'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AuditLog[];
    },
    enabled: !!user,
  });

  const logAction = useMutation({
    mutationFn: async ({
      action,
      table_name,
      record_id,
      old_values,
      new_values
    }: {
      action: string;
      table_name: string;
      record_id?: string;
      old_values?: any;
      new_values?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: user.id,
          action,
          table_name,
          record_id,
          old_values,
          new_values,
          ip_address: null, // Could be populated from request headers
          user_agent: navigator.userAgent,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit_logs'] });
    },
  });

  return {
    auditLogs,
    isLoading,
    error,
    logAction,
  };
};
