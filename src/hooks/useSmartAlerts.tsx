import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SmartAlert {
  id: string;
  type: 'budget_warning' | 'tax_deadline' | 'unusual_spending' | 'bill_reminder' | 'goal_milestone' | 'savings_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
}

export const useSmartAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const generateAlerts = async () => {
    if (!user) return;

    try {
      const newAlerts: SmartAlert[] = [];

      // Fetch spending insights
      const { data: spendingData } = await supabase
        .from('analytics_cache')
        .select('data')
        .eq('user_id', user.id)
        .eq('cache_key', 'spending_insights_month')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (spendingData?.data) {
        const insights = spendingData.data as any;
        
        // Budget warning
        if (insights.savingsRate < 0) {
          newAlerts.push({
            id: 'budget_warning_1',
            type: 'budget_warning',
            severity: 'high',
            title: 'Budget Alert',
            message: `You're spending more than you earn. Current deficit: ${Math.abs(insights.savingsRate).toFixed(1)}%`,
            actionUrl: '/transactions',
            createdAt: new Date().toISOString(),
          });
        }

        // Unusual spending
        if (insights.anomalies?.length > 0) {
          newAlerts.push({
            id: 'unusual_spending_1',
            type: 'unusual_spending',
            severity: 'medium',
            title: 'Unusual Activity Detected',
            message: `${insights.anomalies.length} unusual transactions found. Review for accuracy.`,
            actionUrl: '/advanced-features?tab=ai-security',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Check for tax optimization opportunities
      const { data: taxData } = await supabase
        .from('analytics_cache')
        .select('data')
        .eq('user_id', user.id)
        .like('cache_key', 'tax_optimization_%')
        .gt('expires_at', new Date().toISOString())
        .limit(1)
        .single();

      if (taxData?.data) {
        const tax = taxData.data as any;
        
        if (tax.suggestedDeductions > 5) {
          newAlerts.push({
            id: 'tax_opportunity_1',
            type: 'savings_opportunity',
            severity: 'medium',
            title: 'Tax Deduction Opportunities',
            message: `${tax.suggestedDeductions} potential tax deductions found worth ~${tax.totalPotentialSavings?.toFixed(0) || 0}`,
            actionUrl: '/tax',
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Check financial goals progress
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_achieved', false);

      if (goals) {
        goals.forEach((goal) => {
          const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
          
          if (progress >= 90 && progress < 100) {
            newAlerts.push({
              id: `goal_milestone_${goal.id}`,
              type: 'goal_milestone',
              severity: 'low',
              title: 'Goal Almost Achieved!',
              message: `You're ${progress.toFixed(0)}% of the way to "${goal.goal_name}"`,
              actionUrl: '/dashboard',
              createdAt: new Date().toISOString(),
            });
          }
        });
      }

      // Fetch cash flow forecast
      const { data: forecastData } = await supabase
        .from('analytics_cache')
        .select('data')
        .eq('user_id', user.id)
        .eq('cache_key', 'cashflow_forecast_30d')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (forecastData?.data) {
        const forecast = forecastData.data as any;
        
        // Predict upcoming cash shortfall
        if (forecast.projectedChange < -500) {
          newAlerts.push({
            id: 'bill_reminder_1',
            type: 'bill_reminder',
            severity: 'medium',
            title: 'Upcoming Cash Shortfall',
            message: `Projected to spend ${Math.abs(forecast.projectedChange).toFixed(0)} more than income in next 30 days`,
            actionUrl: '/dashboard',
            createdAt: new Date().toISOString(),
          });
        }

        // Savings opportunity
        if (forecast.projectedChange > 1000) {
          newAlerts.push({
            id: 'savings_opportunity_1',
            type: 'savings_opportunity',
            severity: 'low',
            title: 'Savings Opportunity',
            message: `On track to save ${forecast.projectedChange.toFixed(0)}. Consider investing or setting a new goal.`,
            actionUrl: '/dashboard',
            createdAt: new Date().toISOString(),
          });
        }
      }

      setAlerts(newAlerts.sort((a, b) => {
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }));

      // Show toast for critical alerts
      const criticalAlerts = newAlerts.filter(a => a.severity === 'critical');
      if (criticalAlerts.length > 0) {
        toast({
          title: criticalAlerts[0].title,
          description: criticalAlerts[0].message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAlerts();
    
    // Refresh alerts every 5 minutes
    const interval = setInterval(generateAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  return { alerts, loading, refreshAlerts: generateAlerts };
};
