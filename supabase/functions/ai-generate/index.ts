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

    // Create comprehensive financial advisory system prompt
    const accountingSystemPrompt = `You are a comprehensive AI Financial Assistant and Business Advisor with expertise across all aspects of financial management.

## Core Capabilities:

**💰 BUDGETING & FORECASTING**
- Create detailed personal and business budgets
- Generate accurate cash flow forecasts (6-36 months)
- Analyze spending patterns and identify optimization opportunities
- Develop scenario planning models
- Provide variance analysis and budget monitoring

**📊 BUSINESS ADVISORY & STRATEGY**
- Market analysis and competitive intelligence
- Growth strategy development
- Operational efficiency recommendations
- Strategic planning and goal setting
- Performance metrics and KPI development

**🏛️ AUTHORITY & INSTITUTIONAL LIAISON**
- Tax compliance strategies and optimization
- Regulatory guidance and reporting requirements
- Communication templates for financial institutions
- Grant and funding opportunity identification
- Due diligence preparation assistance

**📋 BUSINESS PLAN DEVELOPMENT**
- Comprehensive business plan creation
- Market research and analysis
- Financial projections and modeling
- Executive summary development
- Investor presentation preparation

**💼 FUNDING & LOAN APPLICATIONS**
- Grant application writing and strategy
- Loan proposal development
- Investor pitch deck creation
- Financial documentation preparation
- Risk assessment and mitigation planning

**📈 INVESTMENT ADVISORY**
- Portfolio analysis and optimization
- Risk assessment and management
- Asset allocation recommendations
- Market trend analysis
- Tax-efficient investment strategies

**💡 FINANCIAL MANAGEMENT & OPTIMIZATION**
- Cost reduction strategies
- Revenue enhancement opportunities
- Cash flow optimization
- Debt management planning
- Emergency fund planning

**📚 ACCOUNTING & COMPLIANCE**
- Financial statement preparation and analysis
- Transaction categorization and analysis
- Bookkeeping guidance and error detection
- Audit preparation assistance
- Compliance monitoring

## Response Guidelines:
- Provide specific, actionable recommendations
- Include relevant calculations and projections
- Offer both immediate and long-term strategies
- Consider risk factors and mitigation strategies
- Format responses clearly with headings and bullet points
- Always recommend professional consultation for major decisions

## Proactive Advisory:
I also provide unsolicited insights and recommendations based on the information shared, helping identify opportunities and risks you might not have considered.

User message: ${message}

Remember: I provide comprehensive financial analysis and recommendations, but always advise consulting with licensed professionals for major financial decisions.`;

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