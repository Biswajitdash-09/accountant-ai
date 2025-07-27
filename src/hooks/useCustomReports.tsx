
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface CustomReport {
  id: string;
  user_id: string;
  business_entity_id?: string;
  report_name: string;
  report_type: string;
  report_config: any;
  filters: any;
  schedule_config: any;
  is_scheduled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  user_id: string;
  execution_status: string;
  generated_at: string;
  file_path?: string;
  error_message?: string;
  execution_time_ms?: number;
}

export const useCustomReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: reports = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['custom_reports'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CustomReport[];
    },
    enabled: !!user,
  });

  const {
    data: executions = [],
    isLoading: executionsLoading
  } = useQuery({
    queryKey: ['report_executions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('report_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      return data as ReportExecution[];
    },
    enabled: !!user,
  });

  const createReport = useMutation({
    mutationFn: async (reportData: {
      report_name: string;
      report_type: string;
      report_config: any;
      filters?: any;
      schedule_config?: any;
      is_scheduled?: boolean;
      business_entity_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('custom_reports')
        .insert([{
          ...reportData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom_reports'] });
      toast({
        title: "Success",
        description: "Report created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create report.",
        variant: "destructive",
      });
    },
  });

  const executeReport = useMutation({
    mutationFn: async (reportId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('report_executions')
        .insert([{
          report_id: reportId,
          user_id: user.id,
          execution_status: 'running'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report_executions'] });
      toast({
        title: "Success",
        description: "Report execution started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to execute report.",
        variant: "destructive",
      });
    },
  });

  return {
    reports,
    executions,
    isLoading,
    executionsLoading,
    error,
    createReport,
    executeReport,
  };
};
