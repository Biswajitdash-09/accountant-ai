import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { voice = 'alloy', instructions } = await req.json().catch(() => ({}));

    // Define tools for Arnold AI actions
    const tools = [
      {
        type: "function",
        name: "generate_report",
        description: "Generate a financial report for the user. Types include: income_expense, balance_sheet, cashflow, tax_summary, investment_performance",
        parameters: {
          type: "object",
          properties: {
            report_type: { 
              type: "string", 
              enum: ["income_expense", "balance_sheet", "cashflow", "tax_summary", "investment_performance"],
              description: "Type of report to generate"
            },
            period: { 
              type: "string", 
              enum: ["this_month", "last_month", "this_quarter", "last_quarter", "this_year", "last_year"],
              description: "Time period for the report"
            },
            format: {
              type: "string",
              enum: ["summary", "detailed", "pdf"],
              description: "Report format - summary for voice, detailed for screen, pdf for download"
            }
          },
          required: ["report_type", "period"]
        }
      },
      {
        type: "function",
        name: "analyze_spending",
        description: "Analyze the user's spending patterns and provide insights",
        parameters: {
          type: "object",
          properties: {
            timeframe: { 
              type: "string", 
              enum: ["last_7_days", "last_30_days", "last_3_months", "last_year"],
              description: "Timeframe for spending analysis"
            },
            category: {
              type: "string",
              description: "Optional category to focus on (e.g., food, transport, utilities)"
            }
          },
          required: ["timeframe"]
        }
      },
      {
        type: "function",
        name: "calculate_tax",
        description: "Calculate tax estimates for the user based on their financial data",
        parameters: {
          type: "object",
          properties: {
            tax_year: { 
              type: "integer",
              description: "Tax year to calculate (e.g., 2024)"
            },
            region: {
              type: "string",
              enum: ["uk", "usa", "nigeria", "india", "eu"],
              description: "Tax jurisdiction"
            },
            include_investments: {
              type: "boolean",
              description: "Include capital gains calculations"
            }
          },
          required: ["tax_year", "region"]
        }
      },
      {
        type: "function",
        name: "forecast_cashflow",
        description: "Predict future cash flow based on historical data",
        parameters: {
          type: "object",
          properties: {
            months_ahead: { 
              type: "integer",
              description: "Number of months to forecast (1-12)"
            },
            include_recurring: {
              type: "boolean",
              description: "Include recurring transactions in forecast"
            }
          },
          required: ["months_ahead"]
        }
      },
      {
        type: "function",
        name: "create_transaction",
        description: "Create a new transaction entry for the user",
        parameters: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["income", "expense"],
              description: "Transaction type"
            },
            amount: {
              type: "number",
              description: "Transaction amount"
            },
            category: {
              type: "string",
              description: "Transaction category (e.g., salary, groceries, rent)"
            },
            description: {
              type: "string",
              description: "Transaction description"
            },
            date: {
              type: "string",
              description: "Transaction date in YYYY-MM-DD format"
            }
          },
          required: ["type", "amount", "category"]
        }
      },
      {
        type: "function",
        name: "get_account_summary",
        description: "Get a summary of the user's accounts and balances",
        parameters: {
          type: "object",
          properties: {
            account_type: {
              type: "string",
              enum: ["all", "bank", "investment", "crypto", "savings"],
              description: "Type of accounts to include"
            }
          },
          required: []
        }
      },
      {
        type: "function",
        name: "search_transactions",
        description: "Search for specific transactions",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search term"
            },
            start_date: {
              type: "string",
              description: "Start date in YYYY-MM-DD format"
            },
            end_date: {
              type: "string",
              description: "End date in YYYY-MM-DD format"
            },
            min_amount: {
              type: "number",
              description: "Minimum transaction amount"
            },
            max_amount: {
              type: "number",
              description: "Maximum transaction amount"
            }
          },
          required: []
        }
      },
      {
        type: "function",
        name: "set_budget",
        description: "Create or update a budget for a category",
        parameters: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Budget category"
            },
            amount: {
              type: "number",
              description: "Budget amount"
            },
            period: {
              type: "string",
              enum: ["weekly", "monthly", "yearly"],
              description: "Budget period"
            }
          },
          required: ["category", "amount", "period"]
        }
      }
    ];

    // System prompt for Arnold AI
    const systemPrompt = instructions || `You are Arnold, a friendly and knowledgeable AI financial assistant for AccountantAI. 

Your personality:
- Warm, professional, and approachable
- Clear and concise in explanations
- Proactive in offering helpful suggestions
- Use simple language, avoid jargon unless explaining it

Your capabilities:
- Generate financial reports (income/expense, balance sheets, cashflow, tax summaries)
- Analyze spending patterns and provide insights
- Calculate tax estimates for various regions
- Forecast cash flow based on historical data
- Create transactions and manage budgets
- Search and retrieve transaction history
- Provide investment and savings advice

When users ask about their finances:
1. Use the available tools to fetch real data
2. Provide specific numbers when available
3. Offer actionable recommendations
4. Ask clarifying questions if needed

Always confirm before creating transactions or making changes. Be conversational but efficient.`;

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: voice,
        instructions: systemPrompt,
        tools: tools,
        tool_choice: "auto",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 800
        },
        temperature: 0.8,
        max_response_output_tokens: 4096
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session creation failed:", response.status, errorText);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log("Voice session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error creating voice session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
