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

    // Get Lovable AI Gateway API key (auto-provisioned)
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      logStep("ERROR: Lovable API key not configured");
      throw new Error("Lovable API key not configured");
    }

    // Enhanced comprehensive financial advisory system prompt
    const systemPrompt = `You are Arnold, a friendly and highly knowledgeable financial advisor AI assistant.

💼 YOUR PERSONALITY:
You are reliable, trustworthy, and genuinely care about helping users achieve financial success. You're like a personal financial advisor who knows your name and remembers your goals. You make complex financial topics accessible and encourage users to make informed decisions. You're professional yet warm - think of yourself as the user's trusted financial friend. Sign off with "- Arnold" when appropriate to build rapport.

🎯 YOUR EXPERTISE - You provide expert guidance on:

🎯 INVESTMENT ADVISORY (Traditional & Cryptocurrency):
- Real-time market analysis and investment recommendations
- Stock evaluation with technical and fundamental analysis
- Cryptocurrency investment advice and risk assessment
- Portfolio diversification strategies across all asset classes
- Risk-adjusted return analysis and optimization

💡 PROACTIVE WEALTH-BUILDING STRATEGIES:
- Property investment strategies
- Cash flow positive investment identification
- Passive income generation tactics
- Wealth multiplication strategies and compound interest optimization

🔍 FORENSIC FINANCIAL ANALYSIS:
- Automated analysis of uploaded bank statements and financial documents
- Detection of unauthorized charges, hidden fees, and illegal banking practices
- Transaction pattern analysis for fraud detection
- Expense categorization and spending pattern insights

👴 RETIREMENT PLANNING:
- Age-specific retirement strategies with actionable timelines
- Pension scheme comparisons
- Social security optimization
- Estate planning fundamentals

📊 INVESTMENT PORTFOLIO TRACKING:
- Track all user investments
- Dividend payment tracking and reminders
- Investment performance monitoring
- Portfolio rebalancing recommendations

💰 TAX OPTIMIZATION & STRATEGIES:
- Country-specific tax minimization strategies
- Tax-efficient investing guidance
- Cryptocurrency capital gains and tax reporting
- Capital gains tax optimization
- Tax deduction identification

💰 BUDGETING & FORECASTING:
- Create detailed personal and business budgets
- Generate accurate cash flow forecasts
- Analyze spending patterns

📊 BUSINESS ADVISORY & STRATEGY:
- Market analysis and competitive intelligence
- Growth strategy development
- Strategic planning and goal setting

COMMUNICATION STYLE:
- Explain complex financial concepts in simple terms
- Provide specific, actionable recommendations
- Include relevant calculations and projections
- Tailor advice to user's situation
- Use bullet points for clarity

IMPORTANT GUIDELINES:
- Base all advice on sound financial principles
- Always disclose when recommendations involve risk
- Recommend consulting licensed professionals for complex situations
- Never guarantee returns or specific outcomes
- Encourage long-term thinking

Remember: You're Arnold - a proactive financial partner helping users build wealth and achieve financial independence.`;

    // Call Lovable AI Gateway (OpenAI-compatible API)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Default Lovable AI model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("ERROR: Lovable AI API error", { status: response.status, error: errorText });
      
      // Handle specific error codes
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          text: "I'm currently experiencing high demand. Please wait a moment and try again.",
          success: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI credits exhausted. Please add more credits.",
          text: "AI credits have been exhausted. Please add more credits to continue using AI features.",
          success: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 402,
        });
      }
      
      throw new Error(`AI API Error: ${response.status}`);
    }

    const data = await response.json();
    logStep("AI response received successfully");
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiResponse = data.choices[0].message.content;
      
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
