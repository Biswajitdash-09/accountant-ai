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

    const { 
      region, 
      taxYear, 
      includeInvestments = true, 
      includeCrypto = true 
    } = await req.json();
    
    const userId = userData.user.id;

    console.log("[ARNOLD-TAX] Optimizing taxes for:", { region, taxYear, userId });

    // Fetch relevant financial data
    const taxData: any = {
      region,
      taxYear,
      income: [],
      expenses: [],
      investments: [],
      crypto: [],
      deductions: [],
      profile: {}
    };

    // Get user profile for region-specific info
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    taxData.profile = profile;

    // Fetch transactions for the tax year
    const yearStart = `${taxYear}-01-01`;
    const yearEnd = `${taxYear}-12-31`;

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', yearStart)
      .lte('date', yearEnd);
    
    if (transactions) {
      taxData.income = transactions.filter(t => t.type === 'income');
      taxData.expenses = transactions.filter(t => t.type === 'expense');
    }

    // Fetch investment data if requested
    if (includeInvestments) {
      const { data: investments } = await supabase
        .from('investment_portfolio')
        .select('*')
        .eq('user_id', userId);
      
      taxData.investments = investments || [];
    }

    // Fetch crypto data if requested
    if (includeCrypto) {
      const { data: cryptoTransactions } = await supabase
        .from('crypto_transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', yearStart)
        .lte('transaction_date', yearEnd);
      
      taxData.crypto = cryptoTransactions || [];

      const { data: cryptoHoldings } = await supabase
        .from('crypto_holdings')
        .select('*')
        .eq('user_id', userId);
      
      taxData.cryptoHoldings = cryptoHoldings || [];
    }

    // Fetch existing tax deductions
    const { data: deductions } = await supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', userId)
      .eq('tax_year', taxYear);
    
    taxData.deductions = deductions || [];

    // Call AI for tax optimization
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API key not configured");

    const systemPrompt = `You are Arnold, an expert tax advisor specializing in multi-region tax optimization. You understand tax laws for ${region} and provide actionable, compliant tax strategies.

USER'S TAX DATA:
${JSON.stringify(taxData, null, 2)}

Analyze this data and provide:
1. Total tax liability estimation for ${region}
2. Missed deduction opportunities
3. Tax optimization strategies specific to ${region}
4. Investment tax implications (traditional + crypto if applicable)
5. Actionable next steps

Use simple language. Explain tax concepts clearly. Be specific about savings amounts.`;

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
          { role: 'user', content: `Optimize my ${taxYear} taxes for ${region}` }
        ],
        max_completion_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const optimization = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ 
      optimization,
      taxData,
      region,
      taxYear,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ARNOLD-TAX] Error:", errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
