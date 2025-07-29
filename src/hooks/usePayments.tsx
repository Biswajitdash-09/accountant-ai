
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Payment {
  id: string;
  user_id: string;
  stripe_session_id: string;
  amount: number;
  currency: string;
  credits: number;
  status: string;
  plan_id: string;
  plan_name: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export const usePayments = () => {
  const { user } = useAuth();

  const {
    data: payments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });

  const successfulPayments = payments.filter(p => p.status === 'paid');
  const totalCreditspurchased = successfulPayments.reduce((sum, p) => sum + p.credits, 0);
  const totalAmountSpent = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    payments,
    successfulPayments,
    totalCreditspurchased,
    totalAmountSpent,
    isLoading,
    error,
    refetch
  };
};
