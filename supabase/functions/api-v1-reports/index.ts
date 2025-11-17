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
    const { report_type, date_range, user_id, sources = ['all'] } = await req.json();

    if (!report_type) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required field: report_type",
        code: "DATA_001",
        available_types: ['financial_summary', 'tax_report', 'cashflow', 'investment_performance']
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const startDate = date_range?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = date_range?.end || new Date().toISOString();

    // Fetch data based on report type
    const [transactions, accounts, investments] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user_id)
        .gte('date', startDate.split('T')[0])
        .lte('date', endDate.split('T')[0]),
      supabase.from('accounts').select('*').eq('user_id', user_id),
      supabase.from('investment_portfolio').select('*').eq('user_id', user_id)
    ]);

    const reportData: any = {
      report_id: crypto.randomUUID(),
      report_type,
      generated_at: new Date().toISOString(),
      period: { start: startDate, end: endDate },
      summary: {}
    };

    // Calculate summary based on report type
    switch (report_type) {
      case 'financial_summary':
        const totalIncome = transactions.data
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        
        const totalExpenses = transactions.data
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

        reportData.summary = {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          net_savings: totalIncome - totalExpenses,
          accounts_balance: accounts.data?.reduce((sum, a) => sum + Number(a.balance || 0), 0) || 0,
          transaction_count: transactions.data?.length || 0
        };
        break;

      case 'tax_report':
        reportData.summary = {
          taxable_income: transactions.data
            ?.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
          deductible_expenses: transactions.data
            ?.filter(t => t.type === 'expense' && t.category?.includes('deductible'))
            .reduce((sum, t) => sum + Number(t.amount), 0) || 0,
          transaction_breakdown: transactions.data || []
        };
        break;

      case 'investment_performance':
        reportData.summary = {
          total_investments: investments.data?.length || 0,
          portfolio_value: investments.data?.reduce((sum, inv) => {
            return sum + (Number(inv.quantity) * Number(inv.purchase_price));
          }, 0) || 0,
          holdings: investments.data || []
        };
        break;

      default:
        reportData.summary = {
          message: "Report type not fully implemented yet",
          data_available: true
        };
    }

    return new Response(JSON.stringify({
      success: true,
      report: reportData
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[REPORTS-API] Error:", error);
    
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
