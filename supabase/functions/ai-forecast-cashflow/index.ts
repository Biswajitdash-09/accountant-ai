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

    const { days = 30 } = await req.json().catch(() => ({}));
    console.log(`Forecasting cash flow for ${days} days for user ${user.id}`);

    // Fetch historical transactions (last 90 days for better prediction)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (txError) throw txError;

    if (!transactions || transactions.length < 10) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Insufficient data for forecasting. Need at least 10 transactions.',
          forecast: {
            predictions: [],
            avgIncome: 0,
            avgExpense: 0,
            projectedBalance: 0,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate historical averages
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

    const avgDailyIncome = totalIncome / 90;
    const avgDailyExpense = totalExpense / 90;

    // Detect recurring patterns (monthly income, weekly expenses)
    const recurringIncome = incomeTransactions.filter(t => t.is_recurring);
    const recurringExpenses = expenseTransactions.filter(t => t.is_recurring);

    // Generate daily predictions for next N days
    const predictions = [];
    const today = new Date();
    let cumulativeBalance = 0;

    for (let i = 1; i <= days; i++) {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);
      
      // Simple time-series prediction (can be replaced with LSTM model)
      const dayOfWeek = forecastDate.getDay();
      const dayOfMonth = forecastDate.getDate();
      
      // Predict income (typically on specific days like salary day)
      let predictedIncome = avgDailyIncome;
      if (dayOfMonth >= 25 && dayOfMonth <= 31) {
        // Salary days
        predictedIncome *= 5; // Boost for salary period
      }

      // Predict expenses (higher on weekends)
      let predictedExpense = avgDailyExpense;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend spending
        predictedExpense *= 1.3;
      }

      // Add recurring transactions
      recurringIncome.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate.getDate() === forecastDate.getDate()) {
          predictedIncome += Math.abs(Number(t.amount) || 0);
        }
      });

      recurringExpenses.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate.getDate() === forecastDate.getDate()) {
          predictedExpense += Math.abs(Number(t.amount) || 0);
        }
      });

      const netFlow = predictedIncome - predictedExpense;
      cumulativeBalance += netFlow;

      predictions.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedIncome: Math.round(predictedIncome * 100) / 100,
        predictedExpense: Math.round(predictedExpense * 100) / 100,
        netFlow: Math.round(netFlow * 100) / 100,
        cumulativeBalance: Math.round(cumulativeBalance * 100) / 100,
        confidence: 0.7, // Confidence decreases over time
      });
    }

    // Get current account balance
    const { data: accounts } = await supabaseClient
      .from('accounts')
      .select('balance')
      .eq('user_id', user.id);

    const currentBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
    const projectedBalance = currentBalance + cumulativeBalance;

    const forecast = {
      predictions,
      avgDailyIncome: Math.round(avgDailyIncome * 100) / 100,
      avgDailyExpense: Math.round(avgDailyExpense * 100) / 100,
      currentBalance: Math.round(currentBalance * 100) / 100,
      projectedBalance: Math.round(projectedBalance * 100) / 100,
      projectedChange: Math.round(cumulativeBalance * 100) / 100,
      forecastPeriod: `${days} days`,
      generatedAt: new Date().toISOString(),
    };

    // Store forecast in database
    await supabaseClient
      .from('analytics_cache')
      .upsert({
        user_id: user.id,
        cache_key: `cashflow_forecast_${days}d`,
        data: forecast,
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
      }, { onConflict: 'user_id,cache_key' });

    console.log(`Forecast complete: projected ${projectedBalance.toFixed(2)} balance in ${days} days`);

    return new Response(
      JSON.stringify({
        success: true,
        forecast,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-forecast-cashflow:', error);
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
