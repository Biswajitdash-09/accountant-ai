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

    const { query, includeData = [] } = await req.json();
    const userId = userData.user.id;

    console.log("[ARNOLD-ANALYSIS] Building comprehensive financial context for user:", userId);

    // Build comprehensive financial context
    const context: any = {
      user: {},
      accounts: { traditional: [], crypto: [], investment: [] },
      netWorth: {},
      cashFlow: {},
      transactions: { recent: [], patterns: [], anomalies: [] },
      investments: {},
      taxSituation: {},
      documents: {},
      goals: {}
    };

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profile) {
      context.user = {
        name: profile.full_name,
        region: profile.country,
        currency: profile.preferred_currency,
        riskTolerance: profile.risk_tolerance
      };
    }

    // Fetch accounts if requested
    if (includeData.includes('accounts') || includeData.length === 0) {
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);
      
      context.accounts.traditional = accounts || [];
    }

    // Fetch crypto wallets
    if (includeData.includes('crypto') || includeData.length === 0) {
      const { data: cryptoWallets } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', userId);
      
      const { data: cryptoHoldings } = await supabase
        .from('crypto_holdings')
        .select('*')
        .eq('user_id', userId);
      
      context.accounts.crypto = cryptoWallets || [];
      context.investments.crypto = cryptoHoldings || [];
    }

    // Fetch recent transactions
    if (includeData.includes('transactions') || includeData.length === 0) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);
      
      context.transactions.recent = transactions || [];
    }

    // Fetch investments
    if (includeData.includes('investments') || includeData.length === 0) {
      const { data: investments } = await supabase
        .from('investment_portfolio')
        .select('*')
        .eq('user_id', userId);
      
      context.investments.stocks = investments || [];
    }

    // Fetch financial goals
    if (includeData.includes('goals') || includeData.length === 0) {
      const { data: goals } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId);
      
      context.goals.active = goals || [];
    }

    // Fetch documents
    if (includeData.includes('documents') || includeData.length === 0) {
      const { data: documents } = await supabase
        .from('documents')
        .select('id, name, type, uploaded_at, extracted_data')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(10);
      
      context.documents.uploaded = documents || [];
    }

    // Calculate net worth from materialized view
    const { data: netWorthData } = await supabase
      .from('mv_user_total_assets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (netWorthData) {
      context.netWorth = netWorthData;
    }

    // Get cash flow analysis
    const { data: cashFlowData } = await supabase
      .from('mv_user_cash_flow')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (cashFlowData) {
      context.cashFlow = cashFlowData;
    }

    console.log("[ARNOLD-ANALYSIS] Context built successfully, calling AI");

    // Call OpenAI with enriched context
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const systemPrompt = `You are Arnold, an AI financial advisor. You have access to the user's complete financial picture. Analyze their data and provide insights in natural, simple language. Avoid jargon. Be proactive and helpful.

User's Financial Context:
${JSON.stringify(context, null, 2)}

Provide comprehensive analysis addressing their query while considering all available data.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        max_completion_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ 
      analysis: aiResponse,
      context: context,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ARNOLD-ANALYSIS] Error:", errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
