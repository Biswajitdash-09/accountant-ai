import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AI-GENERATE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("AI generation request received");

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("No authorization header provided");
    }

    // Initialize Supabase client for user verification
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("ERROR: Authentication failed", { error: userError });
      throw new Error("Authentication failed");
    }

    logStep("User authenticated", { userId: userData.user.id });

    // Get request body
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      logStep("ERROR: Invalid message format");
      throw new Error("Invalid message format");
    }

    logStep("Processing AI request", { messageLength: message.length });

    // Get API key from environment
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) {
      logStep("ERROR: Google AI API key not configured");
      throw new Error("Google AI API key not configured");
    }

    // Create accounting system prompt
    const accountingSystemPrompt = `You are an AI accounting assistant. You ONLY help with accounting tasks and bookkeeping. You do NOT provide financial advice, investment advice, or personal financial planning. 

Your capabilities include:
- Creating financial statements (P&L, Balance Sheet, Cash Flow)
- Analyzing uploaded documents and extracting financial data
- Generating charts and visual breakdowns of expenses/income
- Cross-checking balance sheets for inconsistencies or errors
- Categorizing transactions and expenses
- Explaining accounting concepts and procedures
- Helping with tax preparation and compliance
- Creating budgets and forecasts based on historical data

Always respond with: "This is an AI accounting assistant tool. It cannot provide financial advice or be held liable for financial decisions."

If asked about investments, financial planning, or personal finance advice, politely redirect to accounting-specific tasks.

User message: ${message}`;

    // Call Google AI API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: accountingSystemPrompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("ERROR: Google AI API error", { status: response.status, error: errorText });
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    logStep("AI response received successfully");
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      return new Response(JSON.stringify({ 
        text: aiResponse,
        success: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("ERROR: Invalid AI response format", { response: data });
      throw new Error('Invalid response format from AI');
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in AI generation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});