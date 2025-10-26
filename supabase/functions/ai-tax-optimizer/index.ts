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

    const { taxYear } = await req.json().catch(() => ({}));
    const year = taxYear || new Date().getFullYear();

    console.log(`Optimizing tax for user ${user.id}, year: ${year}`);

    // Get user profile for region
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('region')
      .eq('id', user.id)
      .single();

    const region = profile?.region || 'US';

    // Fetch transactions for the tax year
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);

    // Fetch existing deductions
    const { data: existingDeductions } = await supabaseClient
      .from('tax_deductions')
      .select('*')
      .eq('user_id', user.id);

    const income = transactions
      ?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0) || 0;

    const expenses = transactions
      ?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0) || 0;

    // Analyze potential deductions based on region
    const suggestions = [];
    const deductibleCategories: Record<string, string[]> = {
      US: ['Business Expenses', 'Healthcare', 'Education', 'Charity', 'Home Office', 'Transportation'],
      UK: ['Business Expenses', 'Professional Fees', 'Travel', 'Equipment', 'Training'],
      India: ['Business Expenses', '80C Investments', 'Home Loan Interest', 'Healthcare', 'Education Loan'],
      Nigeria: ['Business Expenses', 'Professional Development', 'Equipment', 'Travel'],
    };

    const eligibleCategories = deductibleCategories[region] || deductibleCategories['US'];

    // Find deductible expenses
    transactions?.forEach(tx => {
      if (tx.type === 'expense') {
        const category = tx.category || '';
        const isDeductible = eligibleCategories.some(cat => 
          category.toLowerCase().includes(cat.toLowerCase())
        );

        if (isDeductible) {
          // Check if already claimed
          const alreadyClaimed = existingDeductions?.some(d => d.transaction_id === tx.id);
          
          if (!alreadyClaimed) {
            suggestions.push({
              transactionId: tx.id,
              description: tx.description,
              amount: Math.abs(Number(tx.amount) || 0),
              category: tx.category,
              date: tx.date,
              deductionType: category,
              estimatedSaving: Math.abs(Number(tx.amount) || 0) * 0.25, // Assume 25% tax rate
              confidence: 0.75,
              reason: `${category} expenses are typically tax-deductible in ${region}`,
            });
          }
        }
      }
    });

    // Region-specific optimization tips
    const tips = [];

    if (region === 'US') {
      if (income > 50000) {
        tips.push('Consider maximizing 401(k) contributions (up to $22,500 for 2024)');
        tips.push('Health Savings Account (HSA) contributions are triple tax-advantaged');
      }
      if (suggestions.some(s => s.category?.includes('Home'))) {
        tips.push('Home office deduction available if you work from home regularly');
      }
    } else if (region === 'UK') {
      tips.push('Personal Allowance: £12,570 tax-free for 2024/25');
      if (income > 50270) {
        tips.push('Consider pension contributions to reduce higher-rate tax');
      }
    } else if (region === 'India') {
      tips.push('Section 80C: Up to ₹1.5 lakh deduction for investments');
      tips.push('Section 80D: ₹25,000 for health insurance premiums');
      if (suggestions.some(s => s.category?.includes('Home'))) {
        tips.push('Section 24: Up to ₹2 lakh for home loan interest');
      }
    } else if (region === 'Nigeria') {
      tips.push('Consolidated Relief Allowance: Higher of ₦200,000 + 20% of gross income or 1% of gross income');
      tips.push('Life insurance premiums are tax-deductible');
    }

    const totalPotentialSavings = suggestions.reduce((sum, s) => sum + (s.estimatedSaving || 0), 0);

    const optimization = {
      taxYear: year,
      region,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      currentDeductions: existingDeductions?.length || 0,
      suggestedDeductions: suggestions.length,
      totalPotentialSavings: Math.round(totalPotentialSavings * 100) / 100,
      suggestions: suggestions.slice(0, 20), // Top 20 suggestions
      optimizationTips: tips,
      generatedAt: new Date().toISOString(),
    };

    // Store in cache
    await supabaseClient
      .from('analytics_cache')
      .upsert({
        user_id: user.id,
        cache_key: `tax_optimization_${year}`,
        data: optimization,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      }, { onConflict: 'user_id,cache_key' });

    console.log(`Tax optimization complete: ${suggestions.length} suggestions, potential savings: ${totalPotentialSavings}`);

    return new Response(
      JSON.stringify({
        success: true,
        optimization,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-tax-optimizer:', error);
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
