import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { period = 'month' } = await req.json().catch(() => ({}));
    console.log(`Analyzing spending patterns for user ${user.id}, period: ${period}`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Fetch transactions
    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (txError) throw txError;

    if (!transactions || transactions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          insights: {
            totalSpent: 0,
            totalIncome: 0,
            netCashFlow: 0,
            topCategories: [],
            trends: [],
            anomalies: [],
            savingsRate: 0,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Analyze spending by category
    const categorySpending: Record<string, number> = {};
    let totalSpent = 0;
    let totalIncome = 0;

    transactions.forEach((tx) => {
      const amount = Math.abs(Number(tx.amount) || 0);
      
      if (tx.type === 'expense') {
        totalSpent += amount;
        const category = tx.category || 'Uncategorized';
        categorySpending[category] = (categorySpending[category] || 0) + amount;
      } else if (tx.type === 'income') {
        totalIncome += amount;
      }
    });

    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }));

    // Calculate weekly spending trend
    const weeklySpending: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const date = new Date(tx.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeklySpending[weekKey] = (weeklySpending[weekKey] || 0) + Math.abs(Number(tx.amount) || 0);
      }
    });

    const trends = Object.entries(weeklySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, amount]) => ({ week, amount }));

    // Detect anomalies (spending > 2x average)
    const avgSpending = totalSpent / (transactions.filter(t => t.type === 'expense').length || 1);
    const anomalies = transactions
      .filter((tx) => tx.type === 'expense' && Math.abs(Number(tx.amount) || 0) > avgSpending * 2)
      .map((tx) => ({
        date: tx.date,
        description: tx.description,
        amount: Math.abs(Number(tx.amount) || 0),
        category: tx.category,
      }))
      .slice(0, 5);

    const netCashFlow = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0;

    // Store insights in database
    const insightsData = {
      user_id: user.id,
      cache_key: `spending_insights_${period}`,
      data: {
        totalSpent,
        totalIncome,
        netCashFlow,
        topCategories,
        trends,
        anomalies,
        savingsRate,
        period,
        analyzedAt: new Date().toISOString(),
      },
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    await supabaseClient
      .from('analytics_cache')
      .upsert(insightsData, { onConflict: 'user_id,cache_key' });

    console.log(`Spending analysis complete: ${totalSpent.toFixed(2)} spent, ${totalIncome.toFixed(2)} income`);

    return new Response(
      JSON.stringify({
        success: true,
        insights: insightsData.data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-analyze-spending:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
