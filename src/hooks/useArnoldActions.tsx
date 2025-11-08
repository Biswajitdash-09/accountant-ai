import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ArnoldAction {
  type: 'generate-report' | 'calculate-tax' | 'analyze-spending' | 'detect-anomalies' | 'forecast-cashflow' | 'optimize-tax';
  params: Record<string, any>;
}

export const useArnoldActions = () => {
  const { toast } = useToast();

  const executeAction = useMutation({
    mutationFn: async (action: ArnoldAction) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let response;

      switch (action.type) {
        case 'generate-report':
          response = await supabase.functions.invoke('arnold-generate-report', {
            body: { userId: user.id, ...action.params },
          });
          break;

        case 'calculate-tax':
          response = await supabase.functions.invoke('arnold-tax-optimizer-universal', {
            body: { userId: user.id, ...action.params },
          });
          break;

        case 'analyze-spending':
          response = await supabase.functions.invoke('ai-analyze-spending', {
            body: { userId: user.id, ...action.params },
          });
          break;

        case 'detect-anomalies':
          response = await supabase.functions.invoke('ai-detect-anomalies', {
            body: { userId: user.id, ...action.params },
          });
          break;

        case 'forecast-cashflow':
          response = await supabase.functions.invoke('ai-forecast-cashflow', {
            body: { userId: user.id, ...action.params },
          });
          break;

        case 'optimize-tax':
          response = await supabase.functions.invoke('ai-tax-optimizer', {
            body: { userId: user.id, ...action.params },
          });
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Action Completed",
        description: `Arnold successfully completed: ${variables.type}`,
      });
    },
    onError: (error, variables) => {
      toast({
        title: "Action Failed",
        description: `Failed to execute: ${variables.type}`,
        variant: "destructive",
      });
      console.error('Arnold action error:', error);
    },
  });

  const generateReport = (reportType: string, dateRange: any, format: string, sources: string[]) => {
    return executeAction.mutate({
      type: 'generate-report',
      params: { reportType, dateRange, format, sources },
    });
  };

  const calculateTax = (region: string, taxYear: number, includeInvestments: boolean, includeCrypto: boolean) => {
    return executeAction.mutate({
      type: 'calculate-tax',
      params: { region, taxYear, includeInvestments, includeCrypto },
    });
  };

  const analyzeSpending = (timeframe: string) => {
    return executeAction.mutate({
      type: 'analyze-spending',
      params: { timeframe },
    });
  };

  const detectAnomalies = (sensitivity: 'low' | 'medium' | 'high') => {
    return executeAction.mutate({
      type: 'detect-anomalies',
      params: { sensitivity },
    });
  };

  const forecastCashflow = (months: number) => {
    return executeAction.mutate({
      type: 'forecast-cashflow',
      params: { months },
    });
  };

  const optimizeTax = (region: string, year: number) => {
    return executeAction.mutate({
      type: 'optimize-tax',
      params: { region, year },
    });
  };

  return {
    executeAction,
    generateReport,
    calculateTax,
    analyzeSpending,
    detectAnomalies,
    forecastCashflow,
    optimizeTax,
    isLoading: executeAction.isPending,
  };
};
