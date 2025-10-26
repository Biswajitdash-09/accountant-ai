import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Insight {
  type: 'success' | 'warning' | 'info' | 'tip';
  message: string;
  icon: React.ReactNode;
  action?: string;
}

const AIInsightsSummary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch cached spending analysis
      const { data: cachedData } = await supabase
        .from('analytics_cache')
        .select('data')
        .eq('user_id', user.id)
        .eq('cache_key', 'spending_insights_month')
        .gt('expires_at', new Date().toISOString())
        .single();

      const generatedInsights: Insight[] = [];

      if (cachedData?.data) {
        const data = cachedData.data as any;

        // Generate insights from spending analysis
        if (data.savingsRate > 20) {
          generatedInsights.push({
            type: 'success',
            message: `Excellent! Your savings rate is ${data.savingsRate.toFixed(1)}% - well above the 20% target!`,
            icon: <TrendingUp className="h-4 w-4" />,
          });
        } else if (data.savingsRate > 0) {
          generatedInsights.push({
            type: 'info',
            message: `Your savings rate is ${data.savingsRate.toFixed(1)}%. Try to increase it to 20% or more.`,
            icon: <TrendingUp className="h-4 w-4" />,
          });
        } else {
          generatedInsights.push({
            type: 'warning',
            message: `You're spending more than you earn. Review your expenses to find savings opportunities.`,
            icon: <AlertTriangle className="h-4 w-4" />,
          });
        }

        // Top spending category insight
        if (data.topCategories?.length > 0) {
          const topCategory = data.topCategories[0];
          generatedInsights.push({
            type: 'info',
            message: `Your biggest expense is ${topCategory.category} at ${topCategory.percentage.toFixed(0)}% of total spending.`,
            icon: <Lightbulb className="h-4 w-4" />,
          });
        }

        // Anomaly alerts
        if (data.anomalies?.length > 0) {
          generatedInsights.push({
            type: 'warning',
            message: `${data.anomalies.length} unusual transactions detected this month. Review them for accuracy.`,
            icon: <AlertTriangle className="h-4 w-4" />,
            action: 'View Anomalies',
          });
        }
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
        
        if (forecast.projectedChange < 0) {
          generatedInsights.push({
            type: 'warning',
            message: `Projected to spend ${Math.abs(forecast.projectedChange).toFixed(0)} more than you earn in the next 30 days.`,
            icon: <AlertTriangle className="h-4 w-4" />,
          });
        } else {
          generatedInsights.push({
            type: 'success',
            message: `On track to save ${forecast.projectedChange.toFixed(0)} in the next 30 days!`,
            icon: <TrendingUp className="h-4 w-4" />,
          });
        }
      }

      // Tax optimization insights
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
        
        if (tax.suggestedDeductions > 0) {
          generatedInsights.push({
            type: 'tip',
            message: `Found ${tax.suggestedDeductions} potential tax deductions worth ~${tax.totalPotentialSavings.toFixed(0)} in savings!`,
            icon: <Lightbulb className="h-4 w-4" />,
            action: 'View Deductions',
          });
        }
      }

      // Default insights if none available
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          type: 'info',
          message: 'Add more transactions to get personalized AI insights and recommendations.',
          icon: <Brain className="h-4 w-4" />,
        });
      }

      setInsights(generatedInsights.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!user || analyzing) return;

    try {
      setAnalyzing(true);
      toast({
        title: "Analyzing your finances",
        description: "This may take a few moments...",
      });

      // Run all AI analyses
      await Promise.all([
        supabase.functions.invoke('ai-analyze-spending', {
          body: { period: 'month' },
        }),
        supabase.functions.invoke('ai-forecast-cashflow', {
          body: { days: 30 },
        }),
        supabase.functions.invoke('ai-tax-optimizer', {
          body: { taxYear: new Date().getFullYear() },
        }),
      ]);

      toast({
        title: "Analysis complete!",
        description: "Your AI insights have been updated.",
      });

      fetchInsights();
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  const getInsightVariant = (type: Insight['type']) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'destructive';
      case 'info': return 'secondary';
      case 'tip': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI Financial Insights</CardTitle>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={runAnalysis}
          disabled={analyzing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              <Badge variant={getInsightVariant(insight.type)} className="mt-0.5">
                {insight.icon}
              </Badge>
              <div className="flex-1">
                <p className="text-sm">{insight.message}</p>
                {insight.action && (
                  <Button
                    size="sm"
                    variant="link"
                    className="h-auto p-0 mt-1"
                  >
                    {insight.action} →
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsSummary;
