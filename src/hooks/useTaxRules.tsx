
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface TaxRule {
  id: string;
  user_id: string;
  business_entity_id?: string;
  rule_name: string;
  rule_type: string;
  conditions: any;
  actions: any;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxComplianceCheck {
  id: string;
  user_id: string;
  business_entity_id?: string;
  check_type: string;
  status: string;
  issues_found: any[];
  recommendations: any[];
  checked_at: string;
  resolved_at?: string;
}

export const useTaxRules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: taxRules = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tax_rules'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tax_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as TaxRule[];
    },
    enabled: !!user,
  });

  const {
    data: complianceChecks = [],
    isLoading: checksLoading
  } = useQuery({
    queryKey: ['tax_compliance_checks'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tax_compliance_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('checked_at', { ascending: false });

      if (error) throw error;
      return data as TaxComplianceCheck[];
    },
    enabled: !!user,
  });

  const createTaxRule = useMutation({
    mutationFn: async (ruleData: {
      rule_name: string;
      rule_type: string;
      conditions: any;
      actions: any;
      priority?: number;
      business_entity_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_rules')
        .insert([{
          ...ruleData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_rules'] });
      toast({
        title: "Success",
        description: "Tax rule created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tax rule.",
        variant: "destructive",
      });
    },
  });

  const runComplianceCheck = useMutation({
    mutationFn: async (checkData: {
      check_type: string;
      business_entity_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_compliance_checks')
        .insert([{
          ...checkData,
          user_id: user.id,
          status: 'running'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_compliance_checks'] });
      toast({
        title: "Success",
        description: "Compliance check started.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to start compliance check.",
        variant: "destructive",
      });
    },
  });

  return {
    taxRules,
    complianceChecks,
    isLoading,
    checksLoading,
    error,
    createTaxRule,
    runComplianceCheck,
  };
};
