
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CreditPlan {
  id: string;
  plan_id: string;
  plan_name: string;
  plan_type: string;
  credits: number;
  price_usd: number;
  price_inr: number;
  price_ngn: number;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const useCreditPlans = () => {
  const {
    data: plans = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['credit_plans'],
    queryFn: async (): Promise<CreditPlan[]> => {
      const { data, error } = await supabase
        .from('credit_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features as string[] : []
      }));
    },
  });

  const getPlanPrice = (plan: CreditPlan, currencyCode: string) => {
    switch (currencyCode) {
      case 'INR':
        return plan.price_inr;
      case 'NGN':
        return plan.price_ngn;
      default:
        return plan.price_usd;
    }
  };

  return {
    plans,
    isLoading,
    error,
    refetch,
    getPlanPrice
  };
};
