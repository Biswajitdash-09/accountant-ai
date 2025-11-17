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
    const url = new URL(req.url);
    const timeframe = url.searchParams.get('timeframe') || '30d';
    const sources = url.searchParams.get('sources') || 'all';
    
    const { user_id } = await req.json().catch(() => ({}));

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

    // Calculate date range based on timeframe
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Fetch all relevant data
    const [accounts, transactions, investments, cryptoWallets, cryptoHoldings] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', user_id),
      supabase.from('transactions').select('*').eq('user_id', user_id).gte('date', startDate),
      supabase.from('investment_portfolio').select('*').eq('user_id', user_id),
      supabase.from('crypto_wallets').select('*').eq('user_id', user_id),
      supabase.from('crypto_holdings').select('*').in('wallet_id', 
        (await supabase.from('crypto_wallets').select('id').eq('user_id', user_id)).data?.map(w => w.id) || []
      )
    ]);

    // Calculate analytics
    const totalAccounts = accounts.data?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
    const totalInvestments = investments.data?.reduce((sum, inv) => {
      return sum + (Number(inv.quantity) * Number(inv.purchase_price));
    }, 0) || 0;
    const totalCrypto = cryptoHoldings.data?.reduce((sum, h) => sum + Number(h.value_usd || 0), 0) || 0;

    const income = transactions.data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const expenses = transactions.data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    // Category breakdown
    const categoryBreakdown: { [key: string]: number } = {};
    transactions.data?.forEach(t => {
      if (t.category) {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      }
    });

    // Generate insights
    const insights = [];
    
    if (expenses > income) {
      insights.push({
        type: 'warning',
        message: `Your expenses (${expenses.toFixed(2)}) exceed your income (${income.toFixed(2)}) this period`,
        action: 'Review your spending patterns',
        priority: 'high'
      });
    }

    if (totalAccounts < 1000) {
      insights.push({
        type: 'suggestion',
        message: 'Consider building an emergency fund of 3-6 months expenses',
        action: 'Set up automatic savings',
        priority: 'medium'
      });
    }

    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({
        type: 'info',
        message: `Your highest spending category is ${topCategory[0]} (${topCategory[1].toFixed(2)})`,
        action: 'Track this category closely',
        priority: 'low'
      });
    }

    return new Response(JSON.stringify({
      success: true,
      analytics: {
        period: { timeframe, start_date: startDate },
        net_worth: {
          total: totalAccounts + totalInvestments + totalCrypto,
          accounts: totalAccounts,
          investments: totalInvestments,
          crypto: totalCrypto
        },
        cash_flow: {
          income,
          expenses,
          net: income - expenses,
          savings_rate: income > 0 ? ((income - expenses) / income * 100).toFixed(2) + '%' : '0%'
        },
        spending_by_category: categoryBreakdown,
        insights,
        data_sources: {
          accounts: accounts.data?.length || 0,
          transactions: transactions.data?.length || 0,
          investments: investments.data?.length || 0,
          crypto_wallets: cryptoWallets.data?.length || 0
        }
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[ANALYTICS-API] Error:", error);
    
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
