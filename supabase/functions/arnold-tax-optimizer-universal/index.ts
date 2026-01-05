import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// NIGERIA 2026 TAX RATES - Nigeria Personal Income Tax Act 2025
// Effective January 1, 2026
// ============================================================================
const NIGERIA_TAX_BANDS_2026 = [
  { min: 0, max: 800000, rate: 0, label: "First ₦800,000 (Exempt)" },
  { min: 800001, max: 3000000, rate: 0.15, label: "₦800,001 - ₦3,000,000 (15%)" },
  { min: 3000001, max: 12000000, rate: 0.18, label: "₦3,000,001 - ₦12,000,000 (18%)" },
  { min: 12000001, max: 25000000, rate: 0.21, label: "₦12,000,001 - ₦25,000,000 (21%)" },
  { min: 25000001, max: 50000000, rate: 0.23, label: "₦25,000,001 - ₦50,000,000 (23%)" },
  { min: 50000001, max: Infinity, rate: 0.25, label: "Above ₦50,000,000 (25%)" },
];

// Calculate Nigeria 2026 Personal Income Tax
function calculateNigeriaTax2026(
  grossIncome: number,
  deductions: {
    pension?: number;
    rent?: number;
    nhis?: number;
    nhf?: number;
    lifeInsurance?: number;
    other?: number;
  } = {}
) {
  const pension = deductions.pension || 0;
  const rent = deductions.rent || 0;
  const nhis = deductions.nhis || 0;
  const nhf = deductions.nhf || 0;
  const lifeInsurance = deductions.lifeInsurance || 0;
  const other = deductions.other || 0;

  // Rent relief: 20% of rent, capped at ₦500,000
  const rentRelief = Math.min(rent * 0.20, 500000);

  const totalDeductions = pension + rentRelief + nhis + nhf + lifeInsurance + other;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Calculate tax using progressive bands
  const breakdown: Array<{ band: string; amount: number; rate: number; tax: number }> = [];
  let totalTax = 0;

  for (const band of NIGERIA_TAX_BANDS_2026) {
    if (taxableIncome <= band.min) continue;

    const bandStart = band.min;
    const bandEnd = Math.min(taxableIncome, band.max);
    const taxableInBand = bandEnd - bandStart;

    if (taxableInBand <= 0) continue;

    const taxInBand = taxableInBand * band.rate;
    totalTax += taxInBand;

    breakdown.push({
      band: band.label,
      amount: Math.round(taxableInBand),
      rate: band.rate * 100,
      tax: Math.round(taxInBand),
    });
  }

  return {
    grossIncome,
    deductions: {
      pension,
      rentRelief,
      nhis,
      nhf,
      lifeInsurance,
      other,
      total: Math.round(totalDeductions),
    },
    taxableIncome: Math.round(taxableIncome),
    breakdown,
    totalTax: Math.round(totalTax),
    monthlyTax: Math.round(totalTax / 12),
    effectiveRate: grossIncome > 0 ? parseFloat(((totalTax / grossIncome) * 100).toFixed(2)) : 0,
    netIncome: Math.round(grossIncome - totalTax),
  };
}

// Format Nigerian Naira
function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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
      region = 'NG', 
      taxYear = new Date().getFullYear(),
      grossIncome,
      deductions,
      includeInvestments = true, 
      includeCrypto = true 
    } = await req.json();
    
    const userId = userData.user.id;

    console.log("[ARNOLD-TAX] Calculating taxes for:", { region, taxYear, userId, grossIncome });

    // If gross income provided directly, calculate immediately
    if (grossIncome && region === 'NG') {
      const result = calculateNigeriaTax2026(grossIncome, deductions || {});
      
      const summary = `
## Nigerian Personal Income Tax Calculation (2026)
**Based on: Nigeria Tax Act 2025 (Effective January 1, 2026)**

### Income & Deductions
- **Gross Annual Income:** ${formatNaira(result.grossIncome)}
- **Pension Contribution:** ${formatNaira(result.deductions.pension)}
- **Rent Relief (20% of rent, max ₦500k):** ${formatNaira(result.deductions.rentRelief)}
- **NHIS:** ${formatNaira(result.deductions.nhis)}
- **NHF:** ${formatNaira(result.deductions.nhf)}
- **Life Insurance:** ${formatNaira(result.deductions.lifeInsurance)}
- **Other Deductions:** ${formatNaira(result.deductions.other)}
- **Total Deductions:** ${formatNaira(result.deductions.total)}

### Taxable Income
${formatNaira(result.taxableIncome)}

### Tax Breakdown (2026 Progressive Rates)
${result.breakdown.map(b => `- ${b.band}: ${formatNaira(b.amount)} × ${b.rate}% = ${formatNaira(b.tax)}`).join('\n')}

### Summary
- **Total Annual Tax Payable:** ${formatNaira(result.totalTax)}
- **Monthly Tax:** ${formatNaira(result.monthlyTax)}
- **Effective Tax Rate:** ${result.effectiveRate}%
- **Net Annual Income:** ${formatNaira(result.netIncome)}
`;

      return new Response(JSON.stringify({
        success: true,
        region,
        taxYear,
        calculation: result,
        summary,
        taxLaw: 'Nigeria Personal Income Tax Act 2025 (Effective January 1, 2026)',
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fetch data from database if not provided
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

    // Get user profile
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
      .gte('transaction_date', yearStart)
      .lte('transaction_date', yearEnd);
    
    let totalIncome = 0;
    let userDeductions: any = {};

    if (transactions) {
      taxData.income = transactions.filter((t: any) => t.transaction_type === 'income');
      taxData.expenses = transactions.filter((t: any) => t.transaction_type === 'expense');
      
      totalIncome = taxData.income.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

      // Identify pension and rent from transactions
      const pensionTxns = transactions.filter((t: any) => 
        t.description?.toLowerCase().includes('pension') ||
        t.category?.toLowerCase().includes('pension')
      );
      const rentTxns = transactions.filter((t: any) =>
        t.description?.toLowerCase().includes('rent') ||
        t.category?.toLowerCase().includes('rent')
      );

      if (pensionTxns.length > 0) {
        userDeductions.pension = pensionTxns.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
      }
      if (rentTxns.length > 0) {
        userDeductions.rent = rentTxns.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
      }
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
    }

    // Fetch existing tax deductions
    const { data: existingDeductions } = await supabase
      .from('tax_deductions')
      .select('*')
      .eq('user_id', userId)
      .eq('tax_year', taxYear);
    
    taxData.deductions = existingDeductions || [];

    // Calculate tax for Nigeria using the 2026 formula
    let result: any;
    let summary = '';

    if (region === 'NG' || region.toLowerCase() === 'nigeria') {
      result = calculateNigeriaTax2026(totalIncome, userDeductions);
      
      summary = `
## Nigerian Personal Income Tax Calculation (2026)
**Based on: Nigeria Tax Act 2025 (Effective January 1, 2026)**

### Income & Deductions
- **Gross Annual Income:** ${formatNaira(result.grossIncome)}
- **Pension Contribution:** ${formatNaira(result.deductions.pension)}
- **Rent Relief (20% of rent, max ₦500k):** ${formatNaira(result.deductions.rentRelief)}
- **Total Deductions:** ${formatNaira(result.deductions.total)}

### Taxable Income
${formatNaira(result.taxableIncome)}

### Tax Breakdown (2026 Progressive Rates)
${result.breakdown.length > 0 
  ? result.breakdown.map((b: any) => `- ${b.band}: ${formatNaira(b.amount)} × ${b.rate}% = ${formatNaira(b.tax)}`).join('\n')
  : '- No tax payable (income within exempt threshold)'}

### Summary
- **Total Annual Tax Payable:** ${formatNaira(result.totalTax)}
- **Monthly Tax:** ${formatNaira(result.monthlyTax)}
- **Effective Tax Rate:** ${result.effectiveRate}%
- **Net Annual Income:** ${formatNaira(result.netIncome)}

### Tax Optimization Tips
${!userDeductions.pension ? '- Consider claiming your pension contribution (8% of gross) as a deduction\n' : ''}
${!userDeductions.rent ? '- You may be eligible for rent relief (20% of rent, up to ₦500,000)\n' : ''}
${totalIncome > 800000 ? '- Consider NHF contributions for additional tax savings\n' : ''}
`;
    } else {
      // For other regions, use AI
      const apiKey = Deno.env.get("OPENAI_API_KEY");
      if (!apiKey) throw new Error("OpenAI API key not configured");

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are Arnold, an expert tax advisor. Calculate taxes for ${region} region.
              
USER'S TAX DATA:
${JSON.stringify(taxData, null, 2)}

Provide accurate tax calculations with breakdown.` 
            },
            { role: 'user', content: `Calculate my ${taxYear} taxes for ${region}` }
          ],
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const data = await response.json();
      summary = data.choices?.[0]?.message?.content || 'Unable to calculate tax';
      result = { totalIncome, region };
    }

    console.log(`[ARNOLD-TAX] Calculation complete for ${region}: Tax = ${result.totalTax || 'N/A'}`);

    return new Response(JSON.stringify({ 
      success: true,
      region,
      taxYear,
      calculation: result,
      summary,
      taxData,
      taxLaw: region === 'NG' ? 'Nigeria Personal Income Tax Act 2025 (Effective January 1, 2026)' : `${region} Tax Law`,
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
