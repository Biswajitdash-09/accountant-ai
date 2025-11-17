import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { months = 3 } = await req.json();

    // Fetch historical transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(200);

    if (txError) throw txError;

    // Calculate monthly trends
    const monthlyData = transactions.reduce((acc: any, tx: any) => {
      const month = tx.date.substring(0, 7);
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0, count: 0 };
      }
      if (tx.type === 'income') {
        acc[month].income += tx.amount;
      } else {
        acc[month].expenses += tx.amount;
      }
      acc[month].count++;
      return acc;
    }, {});

    const monthlyArray = Object.entries(monthlyData)
      .map(([month, data]: [string, any]) => ({
        month,
        netCashFlow: data.income - data.expenses,
        income: data.income,
        expenses: data.expenses,
        transactionCount: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Use AI for prediction if available
    let predictions = [];
    if (openAIApiKey && monthlyArray.length >= 3) {
      const prompt = `Based on this financial data, predict the next ${months} months of cash flow:
${JSON.stringify(monthlyArray.slice(-6), null, 2)}

Provide predictions in JSON format with this structure:
{
  "predictions": [
    {"month": "YYYY-MM", "predictedIncome": number, "predictedExpenses": number, "confidence": number}
  ],
  "insights": ["insight1", "insight2"],
  "trends": {"income": "up/down/stable", "expenses": "up/down/stable"}
}`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a financial analyst. Provide accurate predictions based on historical data.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        const aiData = await response.json();
        const aiPrediction = JSON.parse(aiData.choices[0].message.content);
        predictions = aiPrediction.predictions || [];
        
        return new Response(JSON.stringify({
          historical: monthlyArray,
          predictions: aiPrediction.predictions,
          insights: aiPrediction.insights,
          trends: aiPrediction.trends
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (aiError) {
        console.error('AI prediction error:', aiError);
        // Fall back to simple prediction
      }
    }

    // Simple statistical prediction fallback
    if (predictions.length === 0 && monthlyArray.length >= 3) {
      const avgIncome = monthlyArray.reduce((sum, m) => sum + m.income, 0) / monthlyArray.length;
      const avgExpenses = monthlyArray.reduce((sum, m) => sum + m.expenses, 0) / monthlyArray.length;
      
      predictions = Array.from({ length: months }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() + i + 1);
        return {
          month: date.toISOString().substring(0, 7),
          predictedIncome: avgIncome * (0.95 + Math.random() * 0.1),
          predictedExpenses: avgExpenses * (0.95 + Math.random() * 0.1),
          confidence: 0.6
        };
      });
    }

    return new Response(JSON.stringify({
      historical: monthlyArray,
      predictions,
      insights: ['Historical data used for prediction', 'Consider seasonal variations'],
      trends: { income: 'stable', expenses: 'stable' }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-predict-cashflow:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
