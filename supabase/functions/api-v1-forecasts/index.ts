import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, months = 6, scenario = 'realistic' } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required field: user_id",
        code: "DATA_001"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch last 3 months of transactions for pattern analysis
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .gte('date', threeMonthsAgo.toISOString().split('T')[0]);

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "Insufficient historical data. Need at least 3 months of transactions.",
        code: "DATA_003"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Calculate averages
    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) / 3;

    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0) / 3;

    // Scenario multipliers
    const scenarioMultipliers: any = {
      optimistic: { income: 1.15, expenses: 0.90 },
      realistic: { income: 1.05, expenses: 1.05 },
      pessimistic: { income: 0.95, expenses: 1.15 }
    };

    const multiplier = scenarioMultipliers[scenario] || scenarioMultipliers['realistic'];

    // Get current balance
    const { data: accounts } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', user_id);

    let currentBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;

    // Generate forecasts
    const forecasts = [];
    const today = new Date();

    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(today);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      const projectedIncome = monthlyIncome * multiplier.income * (1 + Math.random() * 0.1 - 0.05);
      const projectedExpenses = monthlyExpenses * multiplier.expenses * (1 + Math.random() * 0.1 - 0.05);
      const netChange = projectedIncome - projectedExpenses;
      currentBalance += netChange;

      forecasts.push({
        month: forecastDate.toISOString().slice(0, 7),
        date: forecastDate.toISOString().split('T')[0],
        projected_income: Math.round(projectedIncome * 100) / 100,
        projected_expenses: Math.round(projectedExpenses * 100) / 100,
        net_change: Math.round(netChange * 100) / 100,
        projected_balance: Math.round(currentBalance * 100) / 100,
        confidence_score: Math.max(0.5, 0.95 - (i * 0.05))
      });
    }

    // Calculate overall confidence
    const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence_score, 0) / forecasts.length;

    // Generate insights
    const insights = [];
    
    const finalBalance = forecasts[forecasts.length - 1].projected_balance;
    const initialBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
    
    if (finalBalance < initialBalance) {
      insights.push({
        type: 'warning',
        message: `Your balance is projected to decrease by ${((initialBalance - finalBalance) / initialBalance * 100).toFixed(1)}% over ${months} months`,
        recommendation: 'Consider reducing expenses or increasing income sources'
      });
    }

    if (finalBalance < monthlyExpenses * 3) {
      insights.push({
        type: 'alert',
        message: 'Your projected balance is below 3 months of expenses',
        recommendation: 'Build an emergency fund to cover unexpected costs'
      });
    }

    const avgNetChange = forecasts.reduce((sum, f) => sum + f.net_change, 0) / forecasts.length;
    if (avgNetChange > 0) {
      insights.push({
        type: 'positive',
        message: `You're projected to save an average of ${avgNetChange.toFixed(2)} per month`,
        recommendation: 'Consider investing surplus funds for long-term growth'
      });
    }

    return new Response(JSON.stringify({
      success: true,
      forecast: {
        scenario,
        period: `${months} months`,
        generated_at: new Date().toISOString(),
        current_balance: initialBalance,
        final_projected_balance: finalBalance,
        total_projected_savings: finalBalance - initialBalance,
        confidence_score: Math.round(avgConfidence * 100) / 100,
        monthly_forecasts: forecasts,
        insights,
        assumptions: {
          avg_monthly_income: Math.round(monthlyIncome * 100) / 100,
          avg_monthly_expenses: Math.round(monthlyExpenses * 100) / 100,
          scenario_adjustments: multiplier,
          data_period: '3 months historical'
        }
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[FORECASTS-API] Error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "SERVER_001"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
