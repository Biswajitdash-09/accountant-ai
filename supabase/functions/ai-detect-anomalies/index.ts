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

    console.log(`Detecting anomalies for user ${user.id}`);

    // Fetch recent transactions (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const { data: recentTx, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (txError) throw txError;

    // Fetch historical data for comparison (90 days)
    const historicalStart = new Date();
    historicalStart.setDate(historicalStart.getDate() - 120);

    const { data: historicalTx, error: histError } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', historicalStart.toISOString().split('T')[0])
      .lt('date', startDate.toISOString().split('T')[0]);

    if (histError) throw histError;

    const anomalies = [];

    if (!recentTx || recentTx.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          anomalies: [],
          summary: {
            total: 0,
            duplicates: 0,
            unusualAmounts: 0,
            suspiciousPatterns: 0,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. Duplicate Detection
    const duplicates = new Map();
    recentTx.forEach((tx) => {
      const key = `${tx.description}_${tx.amount}_${tx.date}`;
      if (duplicates.has(key)) {
        duplicates.get(key).push(tx);
      } else {
        duplicates.set(key, [tx]);
      }
    });

    duplicates.forEach((txs, key) => {
      if (txs.length > 1) {
        anomalies.push({
          type: 'duplicate',
          severity: 'high',
          transactions: txs.map(t => ({ id: t.id, description: t.description, amount: t.amount, date: t.date })),
          message: `Potential duplicate transaction: ${txs[0].description}`,
          recommendation: 'Review and remove duplicate if confirmed',
        });
      }
    });

    // 2. Unusual Amount Detection (Z-score method)
    if (historicalTx && historicalTx.length > 0) {
      const amounts = historicalTx.map(t => Math.abs(Number(t.amount) || 0));
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      recentTx.forEach((tx) => {
        const amount = Math.abs(Number(tx.amount) || 0);
        const zScore = (amount - mean) / (stdDev || 1);

        if (Math.abs(zScore) > 2.5) {
          // More than 2.5 standard deviations from mean
          anomalies.push({
            type: 'unusual_amount',
            severity: Math.abs(zScore) > 3 ? 'critical' : 'medium',
            transaction: {
              id: tx.id,
              description: tx.description,
              amount: tx.amount,
              date: tx.date,
              category: tx.category,
            },
            message: `Unusual transaction amount: ${tx.description} - $${amount}`,
            recommendation: 'Verify this transaction is legitimate',
            zScore: Math.round(zScore * 100) / 100,
          });
        }
      });
    }

    // 3. Suspicious Pattern Detection (multiple transactions from same merchant in short time)
    const merchantFrequency = new Map();
    recentTx.forEach((tx) => {
      const merchant = tx.merchant_name || tx.description;
      if (!merchantFrequency.has(merchant)) {
        merchantFrequency.set(merchant, []);
      }
      merchantFrequency.get(merchant).push(tx);
    });

    merchantFrequency.forEach((txs, merchant) => {
      if (txs.length >= 5) {
        // 5 or more transactions from same merchant in 30 days
        const dates = txs.map(t => new Date(t.date).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const daySpan = (maxDate - minDate) / (1000 * 60 * 60 * 24);

        if (daySpan <= 7) {
          // Multiple transactions within a week
          anomalies.push({
            type: 'suspicious_pattern',
            severity: 'medium',
            merchant,
            transactionCount: txs.length,
            totalAmount: txs.reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0),
            message: `${txs.length} transactions from ${merchant} within ${Math.ceil(daySpan)} days`,
            recommendation: 'Review for potential unauthorized charges',
          });
        }
      }
    });

    // 4. Late Night Transactions (potential fraud indicator)
    recentTx.forEach((tx) => {
      if (tx.created_at) {
        const hour = new Date(tx.created_at).getHours();
        if ((hour >= 0 && hour <= 4) && Math.abs(Number(tx.amount) || 0) > 100) {
          anomalies.push({
            type: 'suspicious_timing',
            severity: 'low',
            transaction: {
              id: tx.id,
              description: tx.description,
              amount: tx.amount,
              date: tx.date,
              time: new Date(tx.created_at).toLocaleTimeString(),
            },
            message: `Transaction at unusual hour: ${tx.description}`,
            recommendation: 'Verify this transaction was authorized',
          });
        }
      }
    });

    const summary = {
      total: anomalies.length,
      duplicates: anomalies.filter(a => a.type === 'duplicate').length,
      unusualAmounts: anomalies.filter(a => a.type === 'unusual_amount').length,
      suspiciousPatterns: anomalies.filter(a => a.type === 'suspicious_pattern').length,
      suspiciousTiming: anomalies.filter(a => a.type === 'suspicious_timing').length,
    };

    console.log(`Anomaly detection complete: ${anomalies.length} anomalies found`);

    return new Response(
      JSON.stringify({
        success: true,
        anomalies: anomalies.slice(0, 20), // Return top 20
        summary,
        analyzedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-detect-anomalies:', error);
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
