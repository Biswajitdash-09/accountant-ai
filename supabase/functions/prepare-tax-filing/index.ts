import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { taxYear, region } = await req.json();

    // Get user profile for region info
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('region, full_name, email')
      .eq('id', user.id)
      .single();

    const userRegion = region || profile?.region || 'US';
    console.log(`Preparing tax filing for user ${user.id}, region: ${userRegion}, year: ${taxYear}`);

    // Fetch all transactions for the tax year
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', `${taxYear}-01-01`)
      .lte('date', `${taxYear}-12-31`)
      .order('date', { ascending: true });

    // Fetch tax deductions
    const { data: deductions } = await supabaseClient
      .from('tax_deductions')
      .select('*')
      .eq('user_id', user.id);

    // Calculate income and expenses
    const income = transactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0) || 0;

    const expenses = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0) || 0;

    const totalDeductions = deductions
      ?.reduce((sum, d) => sum + Math.abs(Number(d.amount) || 0), 0) || 0;

    // Region-specific tax preparation
    let taxData: any = {
      taxYear,
      region: userRegion,
      grossIncome: income,
      totalExpenses: expenses,
      deductions: totalDeductions,
      taxableIncome: Math.max(0, income - totalDeductions),
    };

    switch (userRegion) {
      case 'US':
        // US Tax Filing (IRS)
        taxData = {
          ...taxData,
          form: '1040',
          filingStatus: 'single', // Should be from user preferences
          standardDeduction: 13850, // 2024 standard deduction
          taxableincome: Math.max(0, income - Math.max(13850, totalDeductions)),
          estimatedTax: calculateUSTax(income, totalDeductions),
          exportUrl: null, // Would be TurboTax/H&R Block link
          message: 'Tax data prepared. You can export to TurboTax or H&R Block for e-filing.',
        };
        break;

      case 'UK':
        // UK Tax Filing (HMRC)
        const personalAllowance = 12570; // 2024/25 tax year
        taxData = {
          ...taxData,
          form: 'Self Assessment',
          personalAllowance,
          taxableIncome: Math.max(0, income - personalAllowance - totalDeductions),
          estimatedTax: calculateUKTax(income, personalAllowance, totalDeductions),
          hmrcIntegration: true,
          message: 'Tax data prepared. Use HMRC Integration to file directly.',
        };
        break;

      case 'India':
        // India Tax Filing
        taxData = {
          ...taxData,
          form: 'ITR-1', // Simplified form
          section80C: Math.min(150000, totalDeductions), // Section 80C limit
          basicExemption: 250000, // 2024 basic exemption
          taxableIncome: Math.max(0, income - 250000 - Math.min(150000, totalDeductions)),
          estimatedTax: calculateIndiaTax(income, totalDeductions),
          message: 'Tax data prepared. Export to Income Tax e-filing portal.',
        };
        break;

      case 'Nigeria':
        // Nigeria Tax Filing (FIRS)
        const cra = Math.max(200000, income * 0.01); // Consolidated Relief Allowance
        taxData = {
          ...taxData,
          form: 'Personal Income Tax',
          cra,
          taxableIncome: Math.max(0, income - cra - totalDeductions),
          estimatedTax: calculateNigeriaTax(income, cra, totalDeductions),
          message: 'Tax data prepared. Generate FIRS payment reference.',
        };
        break;

      default:
        throw new Error(`Tax filing not supported for region: ${userRegion}`);
    }

    // Store prepared tax data
    await supabaseClient
      .from('analytics_cache')
      .upsert({
        user_id: user.id,
        cache_key: `tax_filing_${taxYear}_${userRegion.toLowerCase()}`,
        data: taxData,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      }, { onConflict: 'user_id,cache_key' });

    console.log(`Tax filing prepared: ${taxData.estimatedTax} estimated tax`);

    return new Response(
      JSON.stringify({
        success: true,
        taxData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error preparing tax filing:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// US Tax Calculation (simplified)
function calculateUSTax(income: number, deductions: number): number {
  const taxableIncome = Math.max(0, income - Math.max(13850, deductions));
  
  // 2024 tax brackets (single filer)
  if (taxableIncome <= 11600) return taxableIncome * 0.10;
  if (taxableIncome <= 47150) return 1160 + (taxableIncome - 11600) * 0.12;
  if (taxableIncome <= 100525) return 5426 + (taxableIncome - 47150) * 0.22;
  if (taxableIncome <= 191950) return 17168 + (taxableIncome - 100525) * 0.24;
  if (taxableIncome <= 243725) return 38702 + (taxableIncome - 191950) * 0.32;
  if (taxableIncome <= 609350) return 55270 + (taxableIncome - 243725) * 0.35;
  return 183072.50 + (taxableIncome - 609350) * 0.37;
}

// UK Tax Calculation (simplified)
function calculateUKTax(income: number, personalAllowance: number, deductions: number): number {
  const taxableIncome = Math.max(0, income - personalAllowance - deductions);
  
  // 2024/25 tax bands
  if (taxableIncome <= 37700) return taxableIncome * 0.20; // Basic rate
  if (taxableIncome <= 125140) return 7540 + (taxableIncome - 37700) * 0.40; // Higher rate
  return 42488 + (taxableIncome - 125140) * 0.45; // Additional rate
}

// India Tax Calculation (simplified)
function calculateIndiaTax(income: number, deductions: number): number {
  const taxableIncome = Math.max(0, income - 250000 - Math.min(150000, deductions));
  
  // New tax regime (2024)
  if (taxableIncome <= 300000) return 0;
  if (taxableIncome <= 600000) return (taxableIncome - 300000) * 0.05;
  if (taxableIncome <= 900000) return 15000 + (taxableIncome - 600000) * 0.10;
  if (taxableIncome <= 1200000) return 45000 + (taxableIncome - 900000) * 0.15;
  if (taxableIncome <= 1500000) return 90000 + (taxableIncome - 1200000) * 0.20;
  return 150000 + (taxableIncome - 1500000) * 0.30;
}

// Nigeria Tax Calculation (simplified)
function calculateNigeriaTax(income: number, cra: number, deductions: number): number {
  const taxableIncome = Math.max(0, income - cra - deductions);
  
  // Nigeria PAYE tax bands
  if (taxableIncome <= 300000) return taxableIncome * 0.07;
  if (taxableIncome <= 600000) return 21000 + (taxableIncome - 300000) * 0.11;
  if (taxableIncome <= 1100000) return 54000 + (taxableIncome - 600000) * 0.15;
  if (taxableIncome <= 1600000) return 129000 + (taxableIncome - 1100000) * 0.19;
  if (taxableIncome <= 3200000) return 224000 + (taxableIncome - 1600000) * 0.21;
  return 560000 + (taxableIncome - 3200000) * 0.24;
}
