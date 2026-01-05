import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  
  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  userLimit.count++;
  return false;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('Voice service is not configured');
    }

    // Extract user ID from authorization header for rate limiting
    const authHeader = req.headers.get('authorization');
    const userId = authHeader?.split(' ')[1]?.substring(0, 20) || 'anonymous';
    
    // Check rate limit
    if (isRateLimited(userId)) {
      console.warn(`Rate limit exceeded for user: ${userId}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
          code: 'RATE_LIMIT_EXCEEDED'
        }), 
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          },
        }
      );
    }

    const { voice = 'alloy', instructions } = await req.json().catch(() => ({}));

    // Validate voice parameter
    const validVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];
    const selectedVoice = validVoices.includes(voice) ? voice : 'alloy';

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
        description: "Calculate tax estimates for the user based on their financial data. For Nigeria, uses the 2026 Personal Income Tax Act rates.",
        parameters: {
          type: "object",
          properties: {
            tax_year: { 
              type: "integer",
              description: "Tax year to calculate (e.g., 2026)"
            },
            region: {
              type: "string",
              enum: ["uk", "usa", "nigeria", "india", "eu"],
              description: "Tax jurisdiction"
            },
            gross_income: {
              type: "number",
              description: "Gross annual income"
            },
            pension_contribution: {
              type: "number",
              description: "Annual pension contribution (8% of gross for Nigeria)"
            },
            annual_rent: {
              type: "number",
              description: "Annual rent paid (for rent relief calculation)"
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

    // System prompt for Arnold AI with NIGERIA 2026 TAX KNOWLEDGE
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

## NIGERIA 2026 TAX CALCULATION RULES (CRITICAL - USE THESE EXACT FORMULAS)

When calculating Nigerian Personal Income Tax, you MUST use the Nigeria Tax Act 2025 rates (effective January 1, 2026):

### Tax Bands:
| Taxable Income Band | Tax Rate |
|---------------------|----------|
| ₦0 - ₦800,000 | 0% (Exempt) |
| ₦800,001 - ₦3,000,000 | 15% |
| ₦3,000,001 - ₦12,000,000 | 18% |
| ₦12,000,001 - ₦25,000,000 | 21% |
| ₦25,000,001 - ₦50,000,000 | 23% |
| Above ₦50,000,000 | 25% |

### Allowable Deductions:
1. **Pension Contribution**: 8% of gross salary - FULLY DEDUCTIBLE
2. **Rent Relief**: 20% of annual rent paid, CAPPED at ₦500,000 maximum
3. **NHIS**: National Health Insurance contributions - fully deductible
4. **NHF**: National Housing Fund contributions - fully deductible
5. **Life Insurance**: Premiums paid - fully deductible

### Calculation Steps:
1. Calculate pension deduction (if applicable): Gross × 8%
2. Calculate rent relief: Min(Annual Rent × 20%, ₦500,000)
3. Total Deductions = Pension + Rent Relief + NHIS + NHF + Life Insurance
4. Taxable Income = Gross Income - Total Deductions
5. Apply progressive tax bands to taxable income

### Example Calculation (Mr. Sam scenario):
- Gross Income: ₦7,500,000
- Pension (8%): ₦600,000
- Rent Paid: ₦1,200,000 → Rent Relief: ₦240,000 (20% of ₦1,200,000)
- Total Deductions: ₦840,000
- Taxable Income: ₦6,660,000

Tax Calculation:
- First ₦800,000: ₦0 (exempt)
- ₦800,001 - ₦3,000,000: ₦2,200,000 × 15% = ₦330,000
- ₦3,000,001 - ₦6,660,000: ₦3,660,000 × 18% = ₦658,800
- **Total Tax: ₦988,800**
- Effective Rate: 13.18%

When users ask about their finances:
1. Use the available tools to fetch real data
2. Provide specific numbers when available
3. Offer actionable recommendations
4. Ask clarifying questions if needed

Always confirm before creating transactions or making changes. Be conversational but efficient.

If a tool execution fails, explain the error in simple terms and suggest alternatives.`;

    // Request an ephemeral token from OpenAI
    console.log(`Creating voice session with voice: ${selectedVoice}`);
    
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: selectedVoice,
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
      console.error(`OpenAI session creation failed: ${response.status}`, errorText);
      
      // Handle specific OpenAI errors
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Voice service is busy. Please try again in a moment.',
            code: 'SERVICE_BUSY'
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log('Voice session created successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating voice session:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create voice session',
        code: 'SESSION_ERROR'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
