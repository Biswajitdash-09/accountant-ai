import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Investment {
  id: string;
  user_id: string;
  investment_type: 'stock' | 'crypto' | 'real_estate' | 'bonds' | 'mutual_funds' | 'etf' | 'other';
  symbol?: string;
  name: string;
  quantity: number;
  purchase_price: number;
  purchase_date: string;
  current_value?: number;
  currency_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentAlert {
  id: string;
  user_id: string;
  investment_id?: string;
  alert_type: 'dividend' | 'rebalance' | 'underperforming' | 'overperforming' | 'maturity' | 'reminder';
  alert_date: string;
  message: string;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export const useInvestmentTracking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments = [], isLoading: investmentsLoading } = useQuery({
    queryKey: ['user_investments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Investment[];
    },
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['investment_alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('alert_date', { ascending: true });

      if (error) throw error;
      return data as InvestmentAlert[];
    },
  });

  const addInvestment = useMutation({
    mutationFn: async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_investments')
        .insert([{ ...investment, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_investments'] });
      toast({
        title: "Investment added",
        description: "Your investment has been successfully tracked",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add investment",
        variant: "destructive",
      });
      console.error('Add investment error:', error);
    },
  });

  const updateInvestment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Investment> & { id: string }) => {
      const { data, error } = await supabase
        .from('user_investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_investments'] });
      toast({
        title: "Investment updated",
        description: "Your investment has been successfully updated",
      });
    },
  });

  const deleteInvestment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_investments'] });
      toast({
        title: "Investment removed",
        description: "Your investment has been removed from tracking",
      });
    },
  });

  const markAlertAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investment_alerts')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_alerts'] });
    },
  });

  const dismissAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('investment_alerts')
        .update({ is_dismissed: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_alerts'] });
    },
  });

  const unreadAlerts = alerts.filter(a => !a.is_read);

  return {
    investments,
    alerts,
    unreadAlerts,
    isLoading: investmentsLoading || alertsLoading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    markAlertAsRead,
    dismissAlert,
  };
};