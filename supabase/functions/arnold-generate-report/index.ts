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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) throw new Error("Authentication failed");

    const { reportType, dateRange, format = 'json', sources = [] } = await req.json();
    const userId = userData.user.id;

    console.log("[ARNOLD-REPORT] Generating report:", { reportType, dateRange, sources });

    // Fetch data from specified sources
    const reportData: any = {
      metadata: {
        reportType,
        dateRange,
        generatedAt: new Date().toISOString(),
        userId
      },
      data: {}
    };

    // Date filtering
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = dateRange?.end || new Date().toISOString();

    // Fetch transactions
    if (sources.includes('transactions') || sources.length === 0) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      reportData.data.transactions = transactions || [];
    }

    // Fetch crypto data
    if (sources.includes('crypto') || sources.length === 0) {
      const { data: cryptoTransactions } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);
      
      reportData.data.cryptoTransactions = cryptoTransactions || [];

      const { data: cryptoHoldings } = await supabase
        .from('crypto_holdings')
        .select('*')
        .eq('user_id', userId);
      
      reportData.data.cryptoHoldings = cryptoHoldings || [];
    }

    // Fetch accounts
    if (sources.includes('accounts') || sources.length === 0) {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
      
      reportData.data.accounts = accounts || [];
    }

    // Fetch investments
    if (sources.includes('investments') || sources.length === 0) {
      const { data: investments } = await supabase
        .from('investment_portfolio')
        .select('*')
        .eq('user_id', userId);
      
      reportData.data.investments = investments || [];
    }

    // Fetch documents
    if (sources.includes('documents') || sources.length === 0) {
      const { data: documents } = await supabase
        .from('documents')
        .select('id, name, type, uploaded_at')
        .eq('user_id', userId)
        .gte('uploaded_at', startDate)
        .lte('uploaded_at', endDate);
      
      reportData.data.documents = documents || [];
    }

    // Get aggregated data
    const { data: cashFlow } = await supabase
      .from('mv_user_cash_flow')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    reportData.data.cashFlow = cashFlow;

    const { data: netWorth } = await supabase
      .from('mv_user_total_assets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    reportData.data.netWorth = netWorth;

    // Generate AI summary
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (apiKey) {
      const systemPrompt = `You are Arnold, an AI financial advisor. Generate a clear, natural language summary of this financial report. Make it easy to understand, highlighting key insights, trends, and actionable recommendations.

Report Type: ${reportType}
Date Range: ${dateRange?.start} to ${dateRange?.end}
Data: ${JSON.stringify(reportData, null, 2)}

Provide a comprehensive yet concise summary in simple language.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate a ${reportType} report summary` }
          ],
          max_completion_tokens: 2000
        })
      });

      if (response.ok) {
        const data = await response.json();
        reportData.summary = data.choices?.[0]?.message?.content;
      }
    }

    return new Response(JSON.stringify({ 
      report: reportData,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ARNOLD-REPORT] Error:", errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
