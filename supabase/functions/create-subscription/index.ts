import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: any) => console.log(`[CREATE-SUBSCRIPTION] ${step}`, details ?? "");

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error('User not authenticated or email not available');

    const { tier = 'basic', currencyCode = 'USD' } = await req.json();
    log('Request', { tier, currencyCode });

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not set');
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) customerId = (await stripe.customers.create({ email: user.email, metadata: { userId: user.id } })).id;

    // Price map (monthly) in USD cents
    const priceMapUSD: Record<string, number> = { basic: 999, professional: 2999, enterprise: 9999 }; // in cents
    const baseAmountUsdCents = priceMapUSD[tier] ?? priceMapUSD.basic;
    
    // Currency conversion rates (from USD to target currency)
    const currencyRates: Record<string, number> = {
      USD: 1,
      INR: 84.5,  // 1 USD = 84.5 INR
      NGN: 1650   // 1 USD = 1650 NGN
    };

    // Determine currency and amount
    const currency = (currencyCode || 'USD').toLowerCase();
    const rate = currencyRates[currencyCode] || 1;
    const amountInTargetCurrency = Math.round((baseAmountUsdCents / 100) * rate * 100); // Convert to target currency cents

    // Build session with inline recurring price
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: `${tier[0].toUpperCase()}${tier.slice(1)} Subscription` },
            unit_amount: amountInTargetCurrency, // Amount in target currency cents
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/pricing?payment=success` ,
      cancel_url: `${req.headers.get('origin')}/pricing?payment=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log('ERROR', message);
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});
