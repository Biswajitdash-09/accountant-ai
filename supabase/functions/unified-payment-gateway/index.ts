import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateInput, unifiedPaymentSchema } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Parse and validate payment details
    const body = await req.json();
    const validation = validateInput(unifiedPaymentSchema, body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const { provider, plan_id, amount, currency, payment_method } = validation.data;

    // Log payment attempt for fraud detection
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const { data: attemptData } = await supabaseClient
      .from('payment_attempts')
      .insert({
        user_id: user.id,
        ip_address: ipAddress,
        user_agent: userAgent,
        payment_method,
        amount,
        currency,
        status: 'initiated',
        risk_score: 0,
      })
      .select()
      .single();

    // Calculate risk score
    const riskScore = await calculateRiskScore(supabaseClient, user.id, ipAddress, amount);
    
    if (riskScore > 80) {
      await supabaseClient
        .from('payment_attempts')
        .update({ status: 'blocked', risk_score: riskScore })
        .eq('id', attemptData?.id);
        
      throw new Error('Payment blocked due to suspicious activity');
    }

    // Route to appropriate payment provider
    let paymentIntent;
    if (provider === 'stripe') {
      paymentIntent = await createStripePayment(plan_id, amount, currency, user);
    } else if (provider === 'cashfree') {
      paymentIntent = await createCashfreePayment(plan_id, amount, currency, user);
    } else {
      throw new Error('Unsupported payment provider');
    }

    // Update attempt status
    await supabaseClient
      .from('payment_attempts')
      .update({ status: 'success', risk_score: riskScore })
      .eq('id', attemptData?.id);

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntent,
        risk_score: riskScore,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Payment gateway error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function calculateRiskScore(supabase: any, userId: string, ipAddress: string, amount: number): Promise<number> {
  let score = 0;

  // Check for multiple failed attempts in last hour
  const { data: recentAttempts } = await supabase
    .from('payment_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'failed')
    .gte('created_at', new Date(Date.now() - 3600000).toISOString());

  if (recentAttempts && recentAttempts.length > 3) {
    score += 30;
  }

  // Check for unusual amount
  const { data: avgPayment } = await supabase
    .from('payments')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (avgPayment && avgPayment.length > 0) {
    const avg = avgPayment.reduce((sum: number, p: any) => sum + Number(p.amount), 0) / avgPayment.length;
    if (amount > avg * 3) {
      score += 20;
    }
  }

  // Check for multiple IPs
  const { data: ipAttempts } = await supabase
    .from('payment_attempts')
    .select('ip_address')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 86400000).toISOString());

  if (ipAttempts) {
    const uniqueIps = new Set(ipAttempts.map((a: any) => a.ip_address));
    if (uniqueIps.size > 5) {
      score += 25;
    }
  }

  return Math.min(score, 100);
}

async function createStripePayment(planId: string, amount: number, currency: string, user: any) {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) throw new Error('Stripe key not configured');

  const response = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: (amount * 100).toString(),
      currency,
      'metadata[plan_id]': planId,
      'metadata[user_id]': user.id,
    }),
  });

  return await response.json();
}

async function createCashfreePayment(planId: string, amount: number, currency: string, user: any) {
  const cashfreeKey = Deno.env.get('CASHFREE_APP_ID');
  const cashfreeSecret = Deno.env.get('CASHFREE_SECRET_KEY');
  
  if (!cashfreeKey || !cashfreeSecret) throw new Error('Cashfree keys not configured');

  const orderId = `ORDER_${Date.now()}`;
  const response = await fetch('https://sandbox.cashfree.com/pg/orders', {
    method: 'POST',
    headers: {
      'x-client-id': cashfreeKey,
      'x-client-secret': cashfreeSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: currency,
      customer_details: {
        customer_id: user.id,
        customer_email: user.email,
      },
      order_meta: {
        return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cashfree-callback`,
      },
    }),
  });

  return await response.json();
}
