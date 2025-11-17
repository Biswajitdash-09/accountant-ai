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
    const { message, user_id, context = {} } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required field: message",
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

    // Fetch user's financial context
    const [profileData, accountsData, transactionsData] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user_id).single(),
      supabase.from('accounts').select('*').eq('user_id', user_id),
      supabase.from('transactions').select('*').eq('user_id', user_id).order('date', { ascending: false }).limit(10)
    ]);

    const financialContext = {
      user: profileData.data || {},
      accounts: accountsData.data || [],
      recent_transactions: transactionsData.data || [],
      provided_context: context
    };

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: "AI service not configured",
        code: "CONFIG_001"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const systemPrompt = `You are Arnold, an AI financial advisor. You have access to the user's financial data.

User's Financial Context:
${JSON.stringify(financialContext, null, 2)}

Provide clear, actionable advice in simple language. Focus on practical insights and avoid jargon.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ARNOLD-CHAT] OpenAI Error:", errorText);
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    // Log AI usage
    await supabase.from('ai_usage_logs').insert({
      user_id,
      feature: 'arnold-chat-api',
      model: 'gpt-4o-mini',
      tokens_used: data.usage?.total_tokens || 0,
      cost_estimate: (data.usage?.total_tokens || 0) * 0.0000015
    });

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      metadata: {
        model: 'gpt-4o-mini',
        tokens_used: data.usage?.total_tokens || 0,
        context_used: ['profile', 'accounts', 'transactions']
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[ARNOLD-CHAT] Error:", error);
    
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
