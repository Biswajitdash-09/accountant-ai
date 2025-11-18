import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { payment_id, amount, reason } = await req.json();

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .eq('user_id', user.id)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    // Check if already refunded
    if (payment.refunded) {
      throw new Error('Payment already refunded');
    }

    // Validate refund amount
    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      throw new Error('Refund amount exceeds payment amount');
    }

    // Check refund eligibility (within 30 days)
    const paymentDate = new Date(payment.created_at);
    const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSincePayment > 30) {
      throw new Error('Refund period expired (30 days)');
    }

    // Create refund record
    const { data: refund, error: refundError } = await supabaseClient
      .from('refunds')
      .insert({
        payment_id,
        user_id: user.id,
        amount: refundAmount,
        currency: payment.currency,
        reason,
        status: 'pending',
      })
      .select()
      .single();

    if (refundError) throw refundError;

    // Process refund with payment provider
    let providerRefund;
    if (payment.provider === 'stripe') {
      providerRefund = await processStripeRefund(payment.provider_payment_id, refundAmount);
    } else if (payment.provider === 'cashfree') {
      providerRefund = await processCashfreeRefund(payment.provider_payment_id, refundAmount);
    }

    // Update refund status
    await supabaseClient
      .from('refunds')
      .update({
        status: 'completed',
        provider_refund_id: providerRefund.id,
        processed_at: new Date().toISOString(),
      })
      .eq('id', refund.id);

    // Update payment record
    await supabaseClient
      .from('payments')
      .update({
        refunded: true,
        refund_amount: refundAmount,
        status: refundAmount === payment.amount ? 'refunded' : 'partially_refunded',
      })
      .eq('id', payment_id);

    // Deduct credits if they were added
    if (payment.credits_added > 0) {
      await supabaseClient.rpc('deduct_user_credits', {
        p_user_id: user.id,
        p_amount: payment.credits_added,
        p_description: `Refund for payment ${payment_id}`,
      });
    }

    return new Response(
      JSON.stringify({ success: true, refund }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Refund processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processStripeRefund(chargeId: string, amount: number) {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeKey) throw new Error('Stripe key not configured');

  const response = await fetch('https://api.stripe.com/v1/refunds', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      charge: chargeId,
      amount: (amount * 100).toString(),
    }),
  });

  return await response.json();
}

async function processCashfreeRefund(orderId: string, amount: number) {
  const cashfreeKey = Deno.env.get('CASHFREE_APP_ID');
  const cashfreeSecret = Deno.env.get('CASHFREE_SECRET_KEY');
  
  if (!cashfreeKey || !cashfreeSecret) throw new Error('Cashfree keys not configured');

  const refundId = `REFUND_${Date.now()}`;
  const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}/refunds`, {
    method: 'POST',
    headers: {
      'x-client-id': cashfreeKey,
      'x-client-secret': cashfreeSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refund_id: refundId,
      refund_amount: amount,
    }),
  });

  return await response.json();
}
