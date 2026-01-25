import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AutoInsight {
  id: string;
  type: 'spending' | 'savings' | 'investment' | 'tax' | 'budget' | 'goal';
  severity: 'info' | 'warning' | 'success' | 'critical';
  title: string;
  message: string;
  actionUrl?: string;
  confidence: number;
  generatedAt: Date;
}

interface UseAutoInsightsOptions {
  refreshInterval?: number; // in milliseconds, default 15 minutes
  autoRefresh?: boolean;
}

export const useAutoInsights = (options: UseAutoInsightsOptions = {}) => {
  const { refreshInterval = 15 * 60 * 1000, autoRefresh = true } = options;
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<AutoInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasNewInsights, setHasNewInsights] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousInsightCountRef = useRef(0);

  const generateInsights = useCallback(async (silent = false) => {
    if (!user) return;

    try {
      if (!silent) setIsLoading(true);

      // Call the smart alerts engine to generate insights
      const { data, error } = await supabase.functions.invoke('smart-alerts-engine', {
        body: {},
      });

      if (error) {
        console.error('Error generating insights:', error);
        if (!silent) {
          toast({
            title: 'Failed to refresh insights',
            description: 'Please try again later.',
            variant: 'destructive',
          });
        }
        return;
      }

      // Fetch the latest notifications/insights
      const { data: notifications } = await supabase
        .from('arnold_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      const newInsights: AutoInsight[] = (notifications || []).map((n) => {
        const metadata = n.metadata as Record<string, unknown> | null;
        return {
          id: n.id,
          type: mapNotificationType(n.notification_type),
          severity: mapPriorityToSeverity(n.priority),
          title: n.title,
          message: n.message,
          actionUrl: n.action_url || undefined,
          confidence: (metadata?.confidence as number) || 85,
          generatedAt: new Date(n.created_at),
        };
      });

      setInsights(newInsights);
      setLastUpdated(new Date());

      // Check if there are new insights
      if (newInsights.length > previousInsightCountRef.current && previousInsightCountRef.current > 0) {
        setHasNewInsights(true);
        if (!silent) {
          toast({
            title: 'New insights available',
            description: `${newInsights.length - previousInsightCountRef.current} new recommendations for you.`,
          });
        }
      }
      previousInsightCountRef.current = newInsights.length;

    } catch (err) {
      console.error('Auto-insights error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const mapNotificationType = (type: string): AutoInsight['type'] => {
    if (type.includes('budget')) return 'budget';
    if (type.includes('goal')) return 'goal';
    if (type.includes('spending') || type.includes('cashflow')) return 'spending';
    if (type.includes('investment') || type.includes('crypto')) return 'investment';
    if (type.includes('tax')) return 'tax';
    return 'savings';
  };

  const mapPriorityToSeverity = (priority: string): AutoInsight['severity'] => {
    switch (priority) {
      case 'high': return 'critical';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const markAsRead = useCallback(async (insightId: string) => {
    if (!user) return;

    await supabase
      .from('arnold_notifications')
      .update({ is_read: true })
      .eq('id', insightId);

    setInsights((prev) => prev.filter((i) => i.id !== insightId));
  }, [user]);

  const dismissNewInsights = useCallback(() => {
    setHasNewInsights(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      generateInsights(true);
    }
  }, [user]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !user) return;

    intervalRef.current = setInterval(() => {
      generateInsights(true);
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, user, generateInsights]);

  // Realtime subscription for new transactions (triggers insight generation)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('auto-insights-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Debounce - wait 5 seconds after a transaction before regenerating
          setTimeout(() => {
            generateInsights(true);
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, generateInsights]);

  // Realtime subscription for budget updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('auto-insights-budgets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setTimeout(() => {
            generateInsights(true);
          }, 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, generateInsights]);

  return {
    insights,
    isLoading,
    lastUpdated,
    hasNewInsights,
    refreshInsights: () => generateInsights(false),
    markAsRead,
    dismissNewInsights,
  };
};

export type { AutoInsight };
