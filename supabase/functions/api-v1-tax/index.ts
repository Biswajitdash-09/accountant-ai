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

// Nigeria deduction rules (2026)
const NIGERIA_DEDUCTION_RULES = {
  rentReliefRate: 0.20,     // 20% of annual rent
  rentReliefCap: 500000,    // Maximum ₦500,000
  pensionDeductible: true,  // Pension contributions fully deductible
};

// Tax brackets for other regions
const taxRules: any = {
  US: { // United States 2024 (Single Filer)
    brackets: [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11601, max: 47150, rate: 0.12 },
      { min: 47151, max: 100525, rate: 0.22 },
      { min: 100526, max: 191950, rate: 0.24 },
      { min: 191951, max: 243725, rate: 0.32 },
      { min: 243726, max: 609350, rate: 0.35 },
      { min: 609351, max: Infinity, rate: 0.37 }
    ],
    standardDeduction: 14600
  },
  UK: { // United Kingdom 2024/25
    brackets: [
      { min: 0, max: 12570, rate: 0 },
      { min: 12571, max: 50270, rate: 0.20 },
      { min: 50271, max: 125140, rate: 0.40 },
      { min: 125141, max: Infinity, rate: 0.45 }
    ]
  }
};

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
  const rentRelief = Math.min(rent * NIGERIA_DEDUCTION_RULES.rentReliefRate, NIGERIA_DEDUCTION_RULES.rentReliefCap);

  const totalDeductions = pension + rentRelief + nhis + nhf + lifeInsurance + other;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  // Calculate tax using progressive bands
  const breakdown: Array<{ band: string; amount: number; rate: string; tax: number }> = [];
  let totalTax = 0;
  let remainingIncome = taxableIncome;
  let previousMax = 0;

  for (const band of NIGERIA_TAX_BANDS_2026) {
    if (remainingIncome <= 0) break;
    if (taxableIncome <= band.min) continue;

    // Calculate the amount taxable in this band
    const bandStart = band.min;
    const bandEnd = Math.min(taxableIncome, band.max);
    const taxableInBand = bandEnd - bandStart;

    if (taxableInBand <= 0) continue;

    const taxInBand = taxableInBand * band.rate;
    totalTax += taxInBand;

    breakdown.push({
      band: band.label,
      amount: Math.round(taxableInBand),
      rate: (band.rate * 100) + '%',
      tax: Math.round(taxInBand),
    });

    remainingIncome -= taxableInBand;
    previousMax = band.max;
  }

  const effectiveTaxRate = grossIncome > 0 ? ((totalTax / grossIncome) * 100).toFixed(2) : '0';

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
    effectiveTaxRate: effectiveTaxRate + '%',
    netIncome: Math.round(grossIncome - totalTax),
    taxLaw: 'Nigeria Personal Income Tax Act 2025 (Effective January 1, 2026)',
  };
}

// Generic tax calculation for other regions
function calculateTax(income: number, deductions: number, region: string) {
  const rules = taxRules[region];
  if (!rules) {
    throw new Error(`Tax rules not found for region: ${region}`);
  }
  
  const taxableIncome = Math.max(0, income - deductions - (rules.standardDeduction || 0));
  
  let totalTax = 0;
  const breakdown: Array<{ bracket: string; rate: string; taxable_amount: number; tax: number }> = [];

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

    console.log(`[api-v1-tax] Processing tax calculation for region: ${region}, year: ${tax_year}`);

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
    let nigeriaDeductions: any = {};

    if (user_id) {
      // Fetch actual data from database
      const year = tax_year || new Date().getFullYear();
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user_id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (transactions) {
        totalIncome = transactions
          .filter((t: any) => t.transaction_type === 'income')
          .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);

        // Try to identify deductions from transactions
        const pensionTxns = transactions.filter((t: any) => 
          t.description?.toLowerCase().includes('pension') ||
          t.category?.toLowerCase().includes('pension')
        );
        const rentTxns = transactions.filter((t: any) =>
          t.description?.toLowerCase().includes('rent') ||
          t.category?.toLowerCase().includes('rent')
        );

        if (pensionTxns.length > 0) {
          nigeriaDeductions.pension = pensionTxns.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
        }
        if (rentTxns.length > 0) {
          nigeriaDeductions.rent = rentTxns.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
        }
      }

      // Fetch tax deductions
      const { data: taxDeductions } = await supabase
        .from('tax_deductions')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_approved', true);

      if (taxDeductions) {
        nigeriaDeductions.other = (nigeriaDeductions.other || 0) + 
          taxDeductions.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
      }
    } else {
      // Use provided data
      totalIncome = typeof income_data === 'object' 
        ? (income_data.gross_income || income_data.total || 0)
        : Number(income_data || 0);

      // Extract Nigeria-specific deductions
      if (deductions_data) {
        nigeriaDeductions = {
          pension: deductions_data.pension || deductions_data.pension_contribution || 0,
          rent: deductions_data.rent || deductions_data.annual_rent || 0,
          nhis: deductions_data.nhis || 0,
          nhf: deductions_data.nhf || 0,
          lifeInsurance: deductions_data.life_insurance || deductions_data.lifeInsurance || 0,
          other: deductions_data.other || 0,
        };
      }
    }

    let result: any;
    const optimizationTips: Array<{ tip: string; potential_savings?: string; category: string }> = [];

    // Use Nigeria 2026 calculator for NG region
    if (region === 'NG') {
      const ngResult = calculateNigeriaTax2026(totalIncome, nigeriaDeductions);

      result = {
        region: 'NG',
        tax_year: tax_year || new Date().getFullYear(),
        gross_income: ngResult.grossIncome,
        deductions_breakdown: ngResult.deductions,
        total_deductions: ngResult.deductions.total,
        taxable_income: ngResult.taxableIncome,
        total_tax: ngResult.totalTax,
        monthly_tax: ngResult.monthlyTax,
        effective_tax_rate: ngResult.effectiveTaxRate,
        net_income: ngResult.netIncome,
        breakdown: ngResult.breakdown,
        tax_law: ngResult.taxLaw,
        calculated_at: new Date().toISOString(),
      };

      // Nigeria-specific optimization tips
      if (!nigeriaDeductions.pension) {
        optimizationTips.push({
          tip: "Ensure you're claiming your pension contribution (8% of gross salary) as a deduction - it's fully tax-deductible.",
          potential_savings: `Up to ₦${Math.round(totalIncome * 0.08 * 0.18).toLocaleString()}`,
          category: "pension"
        });
      }
      if (!nigeriaDeductions.rent) {
        optimizationTips.push({
          tip: "You may be eligible for rent relief (20% of annual rent paid, up to ₦500,000 maximum).",
          potential_savings: "Up to ₦90,000 in tax savings",
          category: "housing"
        });
      }
      if (totalIncome > 800000 && !nigeriaDeductions.nhf) {
        optimizationTips.push({
          tip: "Consider contributing to the National Housing Fund (NHF) - contributions are tax-deductible.",
          category: "housing"
        });
      }
      if (!nigeriaDeductions.nhis) {
        optimizationTips.push({
          tip: "NHIS (National Health Insurance Scheme) contributions are tax-deductible.",
          category: "health"
        });
      }
    } else {
      // Use generic calculator for other regions
      const totalDeductions = Object.values(nigeriaDeductions).reduce((a: number, b: any) => a + (Number(b) || 0), 0);
      const taxResult = calculateTax(totalIncome, totalDeductions, region);

      result = {
        region,
        tax_year: tax_year || new Date().getFullYear(),
        gross_income: totalIncome,
        total_deductions: totalDeductions,
        taxable_income: taxResult.taxableIncome,
        total_tax: Math.round(taxResult.totalTax),
        effective_tax_rate: totalIncome > 0 ? ((taxResult.totalTax / totalIncome) * 100).toFixed(2) + '%' : '0%',
        breakdown: taxResult.breakdown,
        calculated_at: new Date().toISOString(),
      };
    }

    console.log(`[api-v1-tax] Calculation complete: Tax = ${result.total_tax}, Rate = ${result.effective_tax_rate}`);

    return new Response(JSON.stringify({
      success: true,
      calculation: result,
      optimization_tips: optimizationTips
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[api-v1-tax] Error:", error);
    
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
