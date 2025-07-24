
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface TaxCalculation {
  id: string;
  user_id: string;
  business_entity_id?: string;
  tax_period_id: string;
  calculation_type: 'estimated' | 'final' | 'amended';
  gross_income: number;
  total_deductions: number;
  taxable_income: number;
  tax_liability: number;
  credits_applied: number;
  amount_owed: number;
  calculation_details: any;
  calculated_at: string;
  created_at: string;
  updated_at: string;
}

export const useTaxCalculations = (taxPeriodId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: taxCalculations = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tax_calculations', taxPeriodId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('tax_calculations')
        .select('*')
        .eq('user_id', user.id);

      if (taxPeriodId) {
        query = query.eq('tax_period_id', taxPeriodId);
      }

      const { data, error } = await query.order('calculated_at', { ascending: false });

      if (error) throw error;
      return data as TaxCalculation[];
    },
    enabled: !!user,
  });

  const calculateTax = useMutation({
    mutationFn: async (params: {
      taxPeriodId: string;
      grossIncome: number;
      deductions: number;
      businessEntityId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const taxableIncome = Math.max(0, params.grossIncome - params.deductions);
      const taxLiability = calculateTaxLiability(taxableIncome);
      const amountOwed = Math.max(0, taxLiability);

      const calculationData = {
        user_id: user.id,
        business_entity_id: params.businessEntityId,
        tax_period_id: params.taxPeriodId,
        calculation_type: 'estimated' as const,
        gross_income: params.grossIncome,
        total_deductions: params.deductions,
        taxable_income: taxableIncome,
        tax_liability: taxLiability,
        credits_applied: 0,
        amount_owed: amountOwed,
        calculation_details: {
          standardDeduction: 13850,
          taxBrackets: getTaxBrackets(taxableIncome),
          calculatedAt: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('tax_calculations')
        .insert([calculationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_calculations'] });
      toast({
        title: "Success",
        description: "Tax calculation completed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to calculate tax",
        variant: "destructive",
      });
      console.error('Tax calculation error:', error);
    },
  });

  return {
    taxCalculations,
    isLoading,
    error,
    calculateTax,
  };
};

// Helper functions for tax calculations
const calculateTaxLiability = (taxableIncome: number): number => {
  const brackets = [
    { min: 0, max: 11000, rate: 0.10 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182050, rate: 0.24 },
    { min: 182050, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 }
  ];

  let tax = 0;
  for (const bracket of brackets) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableInBracket * bracket.rate;
    }
  }

  return tax;
};

const getTaxBrackets = (taxableIncome: number) => {
  return [
    { range: "$0 - $11,000", rate: "10%", applicable: taxableIncome > 0 },
    { range: "$11,000 - $44,725", rate: "12%", applicable: taxableIncome > 11000 },
    { range: "$44,725 - $95,375", rate: "22%", applicable: taxableIncome > 44725 },
    { range: "$95,375 - $182,050", rate: "24%", applicable: taxableIncome > 95375 },
    { range: "$182,050 - $231,250", rate: "32%", applicable: taxableIncome > 182050 },
    { range: "$231,250 - $578,125", rate: "35%", applicable: taxableIncome > 231250 },
    { range: "$578,125+", rate: "37%", applicable: taxableIncome > 578125 }
  ];
};
