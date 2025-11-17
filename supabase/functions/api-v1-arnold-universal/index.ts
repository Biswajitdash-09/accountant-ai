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
      query, 
      user_context = {}, 
      actions_allowed = ["generate_report", "calculate_tax", "analyze_data", "forecast", "search_transactions"]
    } = await req.json();
    
    const userId = userData.user.id;

    console.log("[ARNOLD-UNIVERSAL] Processing query:", { query, user_context, userId });

    // Use AI to understand user intent
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OpenAI API key not configured");

    // Analyze intent
    const intentAnalysisPrompt = `You are Arnold, an AI financial assistant. Analyze this user query and determine what actions need to be taken.

User Query: "${query}"
User Context: ${JSON.stringify(user_context)}
Available Actions: ${actions_allowed.join(", ")}

Respond with a JSON object:
{
  "understanding": "brief explanation of what user wants",
  "actions": [
    {
      "type": "generate_report" | "calculate_tax" | "analyze_data" | "forecast" | "search_transactions",
      "params": { /* parameters needed for this action */ },
      "priority": 1
    }
  ],
  "confidence": 0.0-1.0
}`;

    const intentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: intentAnalysisPrompt },
          { role: 'user', content: query }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 1000
      })
    });

    if (!intentResponse.ok) {
      throw new Error(`AI Intent Analysis Error: ${intentResponse.status}`);
    }

    const intentData = await intentResponse.json();
    const intent = JSON.parse(intentData.choices?.[0]?.message?.content || "{}");

    console.log("[ARNOLD-UNIVERSAL] Intent analysis:", intent);

    // Execute actions based on intent
    const actionsPerformed = [];
    const results: any = {};

    for (const action of intent.actions || []) {
      if (!actions_allowed.includes(action.type)) {
        console.log(`[ARNOLD-UNIVERSAL] Action ${action.type} not allowed, skipping`);
        continue;
      }

      try {
        let result;
        
        switch (action.type) {
          case "generate_report":
            const reportResult = await supabase.functions.invoke('arnold-generate-report', {
              body: {
                reportType: action.params?.report_type || 'financial_summary',
                dateRange: action.params?.date_range || {
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                  end: new Date().toISOString()
                },
                sources: action.params?.sources || []
              }
            });
            result = reportResult.data;
            results.report = result;
            break;

          case "calculate_tax":
            const taxResult = await supabase.functions.invoke('arnold-tax-optimizer-universal', {
              body: {
                region: action.params?.region || user_context.region || 'NG',
                taxYear: action.params?.tax_year || new Date().getFullYear(),
                includeInvestments: action.params?.include_investments !== false,
                includeCrypto: action.params?.include_crypto !== false
              }
            });
            result = taxResult.data;
            results.tax = result;
            break;

          case "analyze_data":
            // Fetch user's financial data for analysis
            const { data: transactions } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', userId)
              .gte('date', action.params?.start_date || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
              .lte('date', action.params?.end_date || new Date().toISOString())
              .order('date', { ascending: false });

            const { data: accounts } = await supabase
              .from('accounts')
              .select('*')
              .eq('user_id', userId);

            result = {
              transactions: transactions || [],
              accounts: accounts || [],
              summary: {
                total_transactions: transactions?.length || 0,
                total_accounts: accounts?.length || 0
              }
            };
            results.analysis = result;
            break;

          case "forecast":
            const forecastResult = await supabase.functions.invoke('ai-forecast-cashflow', {
              body: {
                months: action.params?.months || 6,
                scenario: action.params?.scenario || 'realistic'
              }
            });
            result = forecastResult.data;
            results.forecast = result;
            break;

          case "search_transactions":
            const { data: searchResults } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', userId)
              .or(`description.ilike.%${action.params?.query}%,category.ilike.%${action.params?.query}%`)
              .order('date', { ascending: false })
              .limit(action.params?.limit || 50);

            result = searchResults || [];
            results.transactions = result;
            break;

          default:
            console.log(`[ARNOLD-UNIVERSAL] Unknown action type: ${action.type}`);
        }

        actionsPerformed.push({
          type: action.type,
          status: 'success',
          result: result
        });

      } catch (error) {
        console.error(`[ARNOLD-UNIVERSAL] Error executing ${action.type}:`, error);
        actionsPerformed.push({
          type: action.type,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Generate natural language response
    const responsePrompt = `You are Arnold, an AI financial assistant. Based on the user's query and the actions performed, provide a comprehensive, natural language response.

User Query: "${query}"
Intent Understanding: ${intent.understanding}
Actions Performed: ${JSON.stringify(actionsPerformed, null, 2)}
Results: ${JSON.stringify(results, null, 2)}

Provide a clear, concise response that:
1. Directly answers the user's question
2. Highlights key insights from the data
3. Suggests actionable next steps
4. Uses simple, non-technical language
5. Includes specific numbers and facts

Response should be 2-4 paragraphs.`;

    const responseGeneration = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: responsePrompt },
          { role: 'user', content: query }
        ],
        max_completion_tokens: 1500
      })
    });

    if (!responseGeneration.ok) {
      throw new Error(`AI Response Generation Error: ${responseGeneration.status}`);
    }

    const responseData = await responseGeneration.json();
    const answer = responseData.choices?.[0]?.message?.content || "I apologize, I couldn't process that request.";

    // Generate follow-up questions
    const followUpQuestions = [];
    if (results.tax) {
      followUpQuestions.push("Would you like me to identify tax-saving opportunities?");
    }
    if (results.report) {
      followUpQuestions.push("Should I email you this report?");
    }
    if (results.forecast) {
      followUpQuestions.push("Would you like to see different forecast scenarios?");
    }
    if (results.analysis) {
      followUpQuestions.push("Want me to find unusual spending patterns?");
    }

    return new Response(JSON.stringify({
      understanding: intent.understanding,
      answer: answer,
      actions_performed: actionsPerformed,
      results: results,
      follow_up_questions: followUpQuestions.slice(0, 3),
      confidence: intent.confidence || 0.8,
      success: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ARNOLD-UNIVERSAL] Error:", errorMessage);
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
