import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedInsight {
  type: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
  title: string;
  message: string;
  actionUrl?: string;
  confidence: number;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating insights for user: ${user.id}`);

    const insights: GeneratedInsight[] = [];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch user data in parallel
    const [transactionsRes, budgetsRes, goalsRes, accountsRes, cryptoRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).gte('date', thirtyDaysAgo),
      supabase.from('budgets').select('*').eq('user_id', user.id).eq('is_active', true),
      supabase.from('financial_goals').select('*').eq('user_id', user.id).eq('is_achieved', false),
      supabase.from('accounts').select('*').eq('user_id', user.id),
      supabase.from('crypto_wallets').select('id').eq('user_id', user.id),
    ]);

    const transactions = transactionsRes.data || [];
    const budgets = budgetsRes.data || [];
    const goals = goalsRes.data || [];
    const accounts = accountsRes.data || [];
    const cryptoWallets = cryptoRes.data || [];

    // 1. Spending pattern analysis
    if (transactions.length > 0) {
      const expenses = transactions.filter(t => t.type === 'expense');
      const income = transactions.filter(t => t.type === 'income');
      const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

      // Savings rate insight
      if (totalIncome > 0) {
        const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
        if (savingsRate >= 20) {
          insights.push({
            type: 'savings_excellent',
            severity: 'success',
            title: 'Excellent Savings Rate! 🎉',
            message: `You're saving ${savingsRate.toFixed(1)}% of your income - well above the recommended 20%!`,
            actionUrl: '/analytics',
            confidence: 95,
            category: 'savings',
          });
        } else if (savingsRate < 10) {
          insights.push({
            type: 'savings_low',
            severity: 'warning',
            title: 'Savings Rate Needs Attention',
            message: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider reviewing expenses to increase savings.`,
            actionUrl: '/transactions',
            confidence: 90,
            category: 'savings',
          });
        }
      }

      // Category spending analysis
      const categorySpending: Record<string, number> = {};
      expenses.forEach(e => {
        const cat = e.category || 'Other';
        categorySpending[cat] = (categorySpending[cat] || 0) + Math.abs(e.amount);
      });

      const topCategory = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)[0];
      
      if (topCategory && topCategory[1] > totalExpenses * 0.4) {
        insights.push({
          type: 'category_concentration',
          severity: 'info',
          title: `${topCategory[0]} Dominates Spending`,
          message: `${((topCategory[1] / totalExpenses) * 100).toFixed(0)}% of your spending is on ${topCategory[0]}. Consider diversifying.`,
          actionUrl: '/analytics',
          confidence: 88,
          category: 'spending',
        });
      }

      // Week-over-week spending comparison
      const recentWeekExpenses = expenses.filter(t => new Date(t.date) >= new Date(sevenDaysAgo));
      const previousWeekExpenses = expenses.filter(t => {
        const date = new Date(t.date);
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        return date >= fourteenDaysAgo && date < new Date(sevenDaysAgo);
      });

      const recentTotal = recentWeekExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const previousTotal = previousWeekExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      if (previousTotal > 0 && recentTotal > previousTotal * 1.3) {
        insights.push({
          type: 'spending_increase',
          severity: 'warning',
          title: 'Spending Spike Detected',
          message: `Your spending increased ${(((recentTotal - previousTotal) / previousTotal) * 100).toFixed(0)}% this week. Review recent transactions.`,
          actionUrl: '/transactions',
          confidence: 85,
          category: 'spending',
        });
      }
    }

    // 2. Budget insights
    for (const budget of budgets) {
      const spent = budget.actual_spent || 0;
      const total = budget.total_budget;
      const percentage = (spent / total) * 100;

      if (percentage >= 90 && percentage < 100) {
        insights.push({
          type: 'budget_critical',
          severity: 'critical',
          title: `Budget "${budget.name}" Almost Exhausted`,
          message: `You've used ${percentage.toFixed(0)}% of this budget. Only ${(total - spent).toFixed(2)} remaining.`,
          actionUrl: '/dashboard',
          confidence: 95,
          category: 'budget',
        });
      } else if (percentage >= 75) {
        insights.push({
          type: 'budget_warning',
          severity: 'warning',
          title: `Budget Alert: ${budget.name}`,
          message: `You've used ${percentage.toFixed(0)}% of your budget. Consider slowing down spending.`,
          actionUrl: '/dashboard',
          confidence: 90,
          category: 'budget',
        });
      }
    }

    // 3. Goal insights
    for (const goal of goals) {
      const progress = ((goal.current_amount || 0) / goal.target_amount) * 100;
      
      if (goal.target_date) {
        const daysRemaining = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysRemaining <= 30 && progress < 50) {
          insights.push({
            type: 'goal_at_risk',
            severity: 'critical',
            title: `Goal "${goal.goal_name}" at Risk`,
            message: `Only ${daysRemaining} days left but you're at ${progress.toFixed(0)}%. Increase contributions!`,
            actionUrl: '/dashboard',
            confidence: 92,
            category: 'goal',
          });
        } else if (progress >= 75) {
          insights.push({
            type: 'goal_progress',
            severity: 'success',
            title: `Great Progress on "${goal.goal_name}"!`,
            message: `You're ${progress.toFixed(0)}% towards your goal. Keep it up!`,
            actionUrl: '/dashboard',
            confidence: 95,
            category: 'goal',
          });
        }
      }
    }

    // 4. Account balance insights
    for (const account of accounts) {
      if (account.balance < 100) {
        insights.push({
          type: 'low_balance',
          severity: 'critical',
          title: `Low Balance: ${account.account_name}`,
          message: `Account balance is only ${account.balance.toFixed(2)}. Consider transferring funds.`,
          actionUrl: '/accounts',
          confidence: 98,
          category: 'account',
        });
      }
    }

    // 5. Crypto portfolio check
    if (cryptoWallets.length > 0) {
      const { data: holdings } = await supabase
        .from('crypto_holdings')
        .select('*')
        .in('wallet_id', cryptoWallets.map(w => w.id));

      if (holdings && holdings.length > 0) {
        const totalValue = holdings.reduce((sum, h) => sum + (h.value_usd || 0), 0);
        insights.push({
          type: 'crypto_portfolio',
          severity: 'info',
          title: 'Crypto Portfolio Update',
          message: `Your crypto portfolio is worth $${totalValue.toFixed(2)} across ${holdings.length} assets.`,
          actionUrl: '/markets',
          confidence: 95,
          category: 'investment',
        });
      }
    }

    // 6. Tax season reminder (Jan-Apr)
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 0 && currentMonth <= 3) {
      insights.push({
        type: 'tax_reminder',
        severity: 'info',
        title: 'Tax Season Reminder',
        message: 'Tax filing season is here. Ensure all documents and deductions are ready.',
        actionUrl: '/tax',
        confidence: 100,
        category: 'tax',
      });
    }

    // Store insights as notifications
    for (const insight of insights.slice(0, 5)) { // Limit to 5 most important
      await supabase.from('arnold_notifications').upsert({
        user_id: user.id,
        notification_type: insight.type,
        title: insight.title,
        message: insight.message,
        priority: insight.severity === 'critical' ? 'high' : insight.severity === 'warning' ? 'medium' : 'low',
        action_url: insight.actionUrl,
        metadata: { confidence: insight.confidence, category: insight.category, auto_generated: true },
        is_read: false,
      }, {
        onConflict: 'user_id,notification_type',
        ignoreDuplicates: false,
      });
    }

    console.log(`Generated ${insights.length} insights for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        insights_generated: insights.length,
        insights,
        generated_at: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Auto-generate insights error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
