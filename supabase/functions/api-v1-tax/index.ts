import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tax brackets and rates for different regions
const taxRules: any = {
  NG: { // Nigeria
    brackets: [
      { min: 0, max: 300000, rate: 0.07 },
      { min: 300001, max: 600000, rate: 0.11 },
      { min: 600001, max: 1100000, rate: 0.15 },
      { min: 1100001, max: 1600000, rate: 0.19 },
      { min: 1600001, max: 3200000, rate: 0.21 },
      { min: 3200001, max: Infinity, rate: 0.24 }
    ],
    reliefs: {
      consolidated: 200000,
      percentage_of_gross: 0.20
    }
  },
  US: { // United States (simplified)
    brackets: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11001, max: 44725, rate: 0.12 },
      { min: 44726, max: 95375, rate: 0.22 },
      { min: 95376, max: 182100, rate: 0.24 },
      { min: 182101, max: 231250, rate: 0.32 },
      { min: 231251, max: 578125, rate: 0.35 },
      { min: 578126, max: Infinity, rate: 0.37 }
    ],
    standardDeduction: 13850
  },
  UK: { // United Kingdom
    brackets: [
      { min: 0, max: 12570, rate: 0 },
      { min: 12571, max: 50270, rate: 0.20 },
      { min: 50271, max: 125140, rate: 0.40 },
      { min: 125141, max: Infinity, rate: 0.45 }
    ]
  }
};

function calculateTax(income: number, deductions: number, region: string) {
  const rules = taxRules[region] || taxRules['NG'];
  const taxableIncome = Math.max(0, income - deductions);
  
  let totalTax = 0;
  let breakdown = [];

  for (const bracket of rules.brackets) {
    if (taxableIncome <= bracket.min) break;
    
    const taxableAmount = Math.min(taxableIncome, bracket.max) - bracket.min;
    const taxForBracket = taxableAmount * bracket.rate;
    
    if (taxForBracket > 0) {
      totalTax += taxForBracket;
      breakdown.push({
        bracket: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
        rate: (bracket.rate * 100).toFixed(0) + '%',
        taxable_amount: taxableAmount,
        tax: taxForBracket
      });
    }
  }

  return { totalTax, breakdown, taxableIncome };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { region = 'NG', tax_year, income_data, deductions_data, user_id } = await req.json();

    if (!income_data && !user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Provide either income_data or user_id to fetch data automatically",
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

    let totalIncome = 0;
    let totalDeductions = 0;

    if (user_id) {
      // Fetch actual data from database
      const year = tax_year || new Date().getFullYear();
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const [transactions, taxDeductions] = await Promise.all([
        supabase.from('transactions')
          .select('*')
          .eq('user_id', user_id)
          .eq('type', 'income')
          .gte('date', startDate)
          .lte('date', endDate),
        supabase.from('tax_deductions')
          .select('*')
          .eq('user_id', user_id)
          .eq('is_approved', true)
      ]);

      totalIncome = transactions.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      totalDeductions = taxDeductions.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
    } else {
      totalIncome = Array.isArray(income_data) 
        ? income_data.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        : Number(income_data);
      
      totalDeductions = Array.isArray(deductions_data)
        ? deductions_data.reduce((sum, item) => sum + Number(item.amount || 0), 0)
        : Number(deductions_data || 0);
    }

    // Apply region-specific reliefs
    const rules = taxRules[region] || taxRules['NG'];
    if (rules.reliefs) {
      const percentageRelief = totalIncome * rules.reliefs.percentage_of_gross;
      totalDeductions += Math.max(rules.reliefs.consolidated, percentageRelief);
    }
    if (rules.standardDeduction) {
      totalDeductions += rules.standardDeduction;
    }

    const taxCalculation = calculateTax(totalIncome, totalDeductions, region);

    // Generate optimization tips
    const optimizationTips = [];
    
    if (totalDeductions < totalIncome * 0.20) {
      optimizationTips.push({
        tip: "Consider tracking more deductible expenses",
        potential_savings: (totalIncome * 0.05 * (taxCalculation.totalTax / taxCalculation.taxableIncome)).toFixed(2),
        category: "deductions"
      });
    }

    if (region === 'NG' && totalIncome > 3200000) {
      optimizationTips.push({
        tip: "Consider pension contributions to reduce taxable income",
        potential_savings: "Up to 20% of gross income",
        category: "retirement"
      });
    }

    const effectiveTaxRate = totalIncome > 0 
      ? ((taxCalculation.totalTax / totalIncome) * 100).toFixed(2)
      : '0';

    return new Response(JSON.stringify({
      success: true,
      calculation: {
        region,
        tax_year: tax_year || new Date().getFullYear(),
        gross_income: totalIncome,
        total_deductions: totalDeductions,
        taxable_income: taxCalculation.taxableIncome,
        total_tax: taxCalculation.totalTax,
        effective_tax_rate: effectiveTaxRate + '%',
        breakdown: taxCalculation.breakdown,
        optimization_tips: optimizationTips,
        calculated_at: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[TAX-API] Error:", error);
    
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
