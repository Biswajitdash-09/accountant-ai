import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, FileText, Bitcoin, X, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  priority: 'low' | 'medium' | 'high';
  message: string;
  icon: React.ReactNode;
  action?: string;
  actionUrl?: string;
  source?: string;
  confidence?: number;
}

const AIInsightsSummary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>(() => {
    const stored = localStorage.getItem('dismissedInsights');
    return stored ? JSON.parse(stored) : [];
  });

  const dismissInsight = (id: string) => {
    const updated = [...dismissedInsights, id];
    setDismissedInsights(updated);
    localStorage.setItem('dismissedInsights', JSON.stringify(updated));
  };

  const fetchInsights = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const generatedInsights: Insight[] = [];

      // Fetch crypto insights
      const { data: cryptoWallets } = await supabase
        .from('crypto_wallets')
        .select('id')
        .eq('user_id', user.id);

      if (cryptoWallets && cryptoWallets.length > 0) {
        const { data: cryptoHoldings } = await supabase
          .from('crypto_holdings')
          .select('*')
          .in('wallet_id', cryptoWallets.map(w => w.id));
        
        if (cryptoHoldings && cryptoHoldings.length > 0) {
          const totalCryptoValue = cryptoHoldings.reduce((sum, h) => sum + (h.value_usd || 0), 0);
          if (totalCryptoValue > 0) {
            generatedInsights.push({
              id: 'crypto_portfolio',
              type: 'info',
              priority: 'medium',
              message: `Your crypto portfolio is worth $${totalCryptoValue.toFixed(2)}. Track performance across ${cryptoHoldings.length} assets.`,
              icon: <Bitcoin className="h-4 w-4" />,
              action: 'View Crypto',
              actionUrl: '/markets',
              source: 'crypto',
              confidence: 95,
            });
          }
        }
      }

      // Fetch document insights
      const { data: documents } = await supabase
        .from('documents')
        .select('id, file_name, file_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (documents && documents.length > 0) {
        const recentDocs = documents.filter(d => {
          const uploadDate = new Date(d.created_at || '');
          const daysDiff = (new Date().getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7;
        });
        
        if (recentDocs.length > 0) {
          generatedInsights.push({
            id: 'recent_documents',
            type: 'tip',
            priority: 'low',
            message: `${recentDocs.length} documents uploaded recently. Review for potential tax deductions.`,
            icon: <FileText className="h-4 w-4" />,
            action: 'View Documents',
            actionUrl: '/upload',
            source: 'documents',
            confidence: 82,
          });
        }
      }

      // Fetch cached spending analysis
      const { data: cachedData } = await supabase
        .from('analytics_cache')
        .select('data')
        .eq('user_id', user.id)
        .eq('cache_key', 'spending_insights_month')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (cachedData?.data) {
        const data = cachedData.data as any;

        // Generate insights from spending analysis
        if (data.savingsRate > 20) {
          generatedInsights.push({
            id: 'savings_rate_high',
            type: 'success',
            priority: 'low',
            message: `Excellent! Your savings rate is ${data.savingsRate.toFixed(1)}% - well above the 20% target!`,
            icon: <TrendingUp className="h-4 w-4" />,
            action: 'View Analytics',
            actionUrl: '/analytics',
            source: 'analytics',
            confidence: 90,
          });
        }

        // Check for overspending
        if (data.spendingTrend && data.spendingTrend === 'increasing') {
          generatedInsights.push({
            id: 'spending_increasing',
            type: 'warning',
            priority: 'high',
            message: `Your spending has increased significantly. Consider reviewing your budget categories.`,
            icon: <AlertTriangle className="h-4 w-4" />,
            action: 'Review Budget',
            actionUrl: '/dashboard',
            source: 'analytics',
            confidence: 88,
          });
        }
      }

      // Tax season reminder
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 0 && currentMonth <= 3) {
        generatedInsights.push({
          id: 'tax_season',
          type: 'info',
          priority: 'high',
          message: `Tax season is here! Make sure all your documents and transactions are up to date.`,
          icon: <Lightbulb className="h-4 w-4" />,
          action: 'View Tax Center',
          actionUrl: '/tax',
          source: 'system',
          confidence: 100,
        });
      }

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error loading insights",
        description: "Unable to fetch AI insights at this time.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithAI = async () => {
    if (!user) return;

    try {
      setAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('arnold-universal-analysis', {
        body: {
          query: 'Analyze my recent financial activity and provide 3-5 actionable insights',
          includeData: ['transactions', 'accounts', 'crypto', 'investments'],
        },
      });

      if (error) throw error;

      if (data?.analysis) {
        toast({
          title: "Analysis Complete",
          description: "Arnold has generated new insights for you.",
        });
        
        await fetchInsights();
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze data at this time.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [user]);

  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'info':
        return 'border-blue-500 bg-blue-500/10';
      case 'tip':
        return 'border-purple-500 bg-purple-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleAction = (url?: string) => {
    if (url) {
      navigate(url);
    }
  };

  const visibleInsights = insights.filter(i => !dismissedInsights.includes(i.id));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>Arnold's Insights</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={analyzeWithAI}
          disabled={analyzing}
          className="h-8 gap-2"
        >
          <RefreshCw className={`h-3 w-3 ${analyzing ? 'animate-spin' : ''}`} />
          {analyzing ? 'Analyzing...' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : visibleInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Brain className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">No insights yet</p>
            <p className="text-xs">Arnold is learning your financial patterns</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={analyzeWithAI}
            >
              Generate Insights
            </Button>
          </div>
        ) : (
          visibleInsights.map((insight) => (
            <Card key={insight.id} className={`relative group hover:shadow-md transition-all ${getTypeColor(insight.type)}`}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 z-10"
                onClick={() => dismissInsight(insight.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="pt-4 pb-3">
                <div className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    {insight.icon}
                  </div>
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(insight.priority)}`}>
                        {insight.priority} priority
                      </Badge>
                      {insight.confidence && (
                        <span className="text-xs text-muted-foreground">
                          {insight.confidence}% confident
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{insight.message}</p>
                    {insight.action && insight.actionUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs -ml-3"
                        onClick={() => handleAction(insight.actionUrl)}
                      >
                        {insight.action}
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsightsSummary;
