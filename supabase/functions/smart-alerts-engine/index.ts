import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmartAlert {
  type: string;
  title: string;
  message: string;
  priority: string;
  action_url?: string;
  metadata: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's financial data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [transactions, budgets, goals, accounts] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo),
      supabase.from('budgets').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('financial_goals').select('*').eq('user_id', user.id).eq('is_achieved', false),
      supabase.from('accounts').select('*').eq('user_id', user.id),
    ]);

    const alerts: SmartAlert[] = [];

    // 1. Budget Alerts
    if (budgets.data) {
      for (const budget of budgets.data) {
        const spent = budget.actual_spent || 0;
        const total = budget.total_budget;
        const percentageUsed = (spent / total) * 100;

        if (percentageUsed >= 90) {
          alerts.push({
            type: 'budget_critical',
            title: 'Budget Alert: Almost Exhausted',
            message: `Your budget "${budget.name}" is ${percentageUsed.toFixed(0)}% used. Consider reducing spending.`,
            priority: 'high',
            action_url: '/dashboard',
            metadata: { budget_id: budget.id, percentage: percentageUsed },
          });
        } else if (percentageUsed >= 75) {
          alerts.push({
            type: 'budget_warning',
            title: 'Budget Alert: 75% Used',
            message: `You've used ${percentageUsed.toFixed(0)}% of your "${budget.name}" budget.`,
            priority: 'medium',
            action_url: '/dashboard',
            metadata: { budget_id: budget.id, percentage: percentageUsed },
          });
        }
      }
    }

    // 2. Goal Progress Alerts
    if (goals.data) {
      for (const goal of goals.data) {
        const current = goal.current_amount || 0;
        const target = goal.target_amount;
        const progress = (current / target) * 100;

        if (goal.target_date) {
          const targetDate = new Date(goal.target_date);
          const daysRemaining = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          if (progress >= 75 && progress < 100) {
            alerts.push({
              type: 'goal_progress',
              title: 'Great Progress on Goal!',
              message: `You're ${progress.toFixed(0)}% towards "${goal.goal_name}". Keep it up!`,
              priority: 'low',
              action_url: '/dashboard',
              metadata: { goal_id: goal.id, progress },
            });
          }

          if (daysRemaining <= 30 && progress < 50) {
            alerts.push({
              type: 'goal_at_risk',
              title: 'Goal at Risk',
              message: `"${goal.goal_name}" has only ${daysRemaining} days left but is only ${progress.toFixed(0)}% complete.`,
              priority: 'high',
              action_url: '/dashboard',
              metadata: { goal_id: goal.id, days_remaining: daysRemaining, progress },
            });
          }
        }
      }
    }

    // 3. Cash Flow Alerts
    if (transactions.data) {
      const income = transactions.data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions.data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const netCashFlow = income - expenses;

      if (netCashFlow < 0 && Math.abs(netCashFlow) > income * 0.1) {
        alerts.push({
          type: 'negative_cashflow',
          title: 'Negative Cash Flow Warning',
          message: `Your expenses exceed income by ${Math.abs(netCashFlow).toFixed(2)} this month. Review your spending.`,
          priority: 'high',
          action_url: '/transactions',
          metadata: { net_cashflow: netCashFlow },
        });
      }

      // Unusual spending pattern detection
      const recentWeek = transactions.data.filter(t => {
        const txDate = new Date(t.date);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return t.type === 'expense' && txDate >= sevenDaysAgo;
      });

      const previousWeek = transactions.data.filter(t => {
        const txDate = new Date(t.date);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return t.type === 'expense' && txDate >= fourteenDaysAgo && txDate < sevenDaysAgo;
      });

      const recentTotal = recentWeek.reduce((sum, t) => sum + t.amount, 0);
      const previousTotal = previousWeek.reduce((sum, t) => sum + t.amount, 0);

      if (previousTotal > 0 && recentTotal > previousTotal * 1.5) {
        const increase = ((recentTotal - previousTotal) / previousTotal * 100).toFixed(0);
        alerts.push({
          type: 'spending_spike',
          title: 'Unusual Spending Detected',
          message: `Your spending increased by ${increase}% this week compared to last week.`,
          priority: 'medium',
          action_url: '/analytics',
          metadata: { increase_percentage: increase, recent_total: recentTotal, previous_total: previousTotal },
        });
      }
    }

    // 4. Low Balance Alerts
    if (accounts.data) {
      for (const account of accounts.data) {
        if (account.balance < 100) {
          alerts.push({
            type: 'low_balance',
            title: 'Low Account Balance',
            message: `Your ${account.account_name} has a low balance of ${account.balance.toFixed(2)}.`,
            priority: 'high',
            action_url: '/accounts',
            metadata: { account_id: account.id, balance: account.balance },
          });
        }
      }
    }

    // Save alerts as notifications
    for (const alert of alerts) {
      await supabase.from('arnold_notifications').insert({
        user_id: user.id,
        title: alert.title,
        message: alert.message,
        notification_type: alert.type,
        priority: alert.priority,
        action_url: alert.action_url,
        metadata: alert.metadata,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_generated: alerts.length,
        alerts,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Smart alerts error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
