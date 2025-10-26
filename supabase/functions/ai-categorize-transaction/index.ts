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

    const { transactions } = await req.json();
    console.log(`Processing ${transactions?.length || 0} transactions for categorization`);

    if (!transactions || !Array.isArray(transactions)) {
      throw new Error('Invalid transactions data');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    const categorizedTransactions = [];

    for (const transaction of transactions) {
      let category = 'Uncategorized';
      let subcategory = null;
      let confidence = 0.5;

      // Rule-based fallback categorization
      const description = (transaction.description || '').toLowerCase();
      const merchant = (transaction.merchant_name || '').toLowerCase();
      const amount = Math.abs(transaction.amount || 0);

      // Enhanced rule-based system
      if (description.includes('salary') || description.includes('payroll') || description.includes('wage')) {
        category = 'Income';
        subcategory = 'Salary';
        confidence = 0.9;
      } else if (description.includes('rent') || merchant.includes('property') || merchant.includes('landlord')) {
        category = 'Housing';
        subcategory = 'Rent';
        confidence = 0.85;
      } else if (description.includes('electric') || description.includes('water') || description.includes('gas') || description.includes('utility')) {
        category = 'Utilities';
        subcategory = 'Bills';
        confidence = 0.85;
      } else if (merchant.includes('restaurant') || merchant.includes('cafe') || merchant.includes('mcdonald') || merchant.includes('starbucks') || merchant.includes('pizza')) {
        category = 'Food & Dining';
        subcategory = 'Restaurants';
        confidence = 0.8;
      } else if (merchant.includes('grocery') || merchant.includes('supermarket') || merchant.includes('tesco') || merchant.includes('walmart') || merchant.includes('sainsbury')) {
        category = 'Food & Dining';
        subcategory = 'Groceries';
        confidence = 0.8;
      } else if (merchant.includes('uber') || merchant.includes('lyft') || merchant.includes('taxi') || description.includes('transport')) {
        category = 'Transportation';
        subcategory = 'Ride Share';
        confidence = 0.8;
      } else if (merchant.includes('netflix') || merchant.includes('spotify') || merchant.includes('hulu') || merchant.includes('disney') || description.includes('subscription')) {
        category = 'Subscriptions';
        subcategory = 'Entertainment';
        confidence = 0.85;
      } else if (merchant.includes('amazon') || merchant.includes('ebay') || description.includes('shopping')) {
        category = 'Shopping';
        subcategory = 'Online';
        confidence = 0.7;
      } else if (description.includes('insurance')) {
        category = 'Insurance';
        subcategory = 'Premium';
        confidence = 0.85;
      } else if (description.includes('tax') || merchant.includes('hmrc') || merchant.includes('irs')) {
        category = 'Taxes';
        subcategory = 'Payment';
        confidence = 0.9;
      }

      // If OpenAI API is available, use AI categorization for better accuracy
      if (OPENAI_API_KEY && confidence < 0.8) {
        try {
          const prompt = `Categorize this financial transaction:
Description: ${transaction.description}
Merchant: ${transaction.merchant_name || 'Unknown'}
Amount: ${amount}

Return a JSON object with:
- category (one of: Income, Housing, Food & Dining, Transportation, Utilities, Entertainment, Healthcare, Shopping, Travel, Business Expenses, Taxes, Insurance, Education, Gifts & Donations, Personal Care, Subscriptions)
- subcategory (a more specific classification)
- confidence (0-1 score)

JSON only, no explanation.`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a financial transaction categorization expert. Return only valid JSON.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.3,
              max_tokens: 150,
            }),
          });

          if (response.ok) {
            const aiResult = await response.json();
            const aiCategory = JSON.parse(aiResult.choices[0].message.content);
            category = aiCategory.category || category;
            subcategory = aiCategory.subcategory || subcategory;
            confidence = aiCategory.confidence || confidence;
          }
        } catch (aiError) {
          console.error('AI categorization failed, using rule-based:', aiError);
        }
      }

      categorizedTransactions.push({
        id: transaction.id,
        category,
        subcategory,
        confidence,
      });
    }

    // Update transactions in database
    for (const cat of categorizedTransactions) {
      await supabaseClient
        .from('transactions')
        .update({
          category: cat.category,
          subcategory: cat.subcategory,
        })
        .eq('id', cat.id)
        .eq('user_id', user.id);
    }

    console.log(`Successfully categorized ${categorizedTransactions.length} transactions`);

    return new Response(
      JSON.stringify({
        success: true,
        categorized: categorizedTransactions.length,
        results: categorizedTransactions,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-categorize-transaction:', error);
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
