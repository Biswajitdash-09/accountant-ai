
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { planId, currencyCode = 'USD' } = await req.json();
    logStep("Request data", { planId, currencyCode });

    // Get plan details from database
    const { data: planData, error: planError } = await supabaseClient
      .from('credit_plans')
      .select('*')
      .eq('plan_id', planId)
      .eq('is_active', true)
      .single();

    if (planError || !planData) {
      throw new Error("Invalid or inactive plan ID");
    }

    logStep("Plan found", planData);

    // Validate currency and get pricing
    const validCurrencies = ['USD', 'INR', 'NGN'];
    if (!validCurrencies.includes(currencyCode)) {
      throw new Error(`Unsupported currency: ${currencyCode}`);
    }

    let amount: number;
    let currency: string;

    switch (currencyCode) {
      case 'INR':
        amount = planData.price_inr;
        currency = 'inr';
        break;
      case 'NGN':
        amount = planData.price_ngn;
        currency = 'ngn';
        break;
      default:
        amount = planData.price_usd;
        currency = 'usd';
    }

    if (amount <= 0) {
      throw new Error("Invalid pricing for selected plan and currency");
    }

    logStep("Pricing determined", { currency, amount, currencyCode });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Configure payment methods based on currency and region
    let paymentMethodTypes: string[] = ['card'];
    
    // UPI is only available for INR in India
    if (currencyCode === 'INR') {
      paymentMethodTypes.push('upi');
    }
    
    // Note: NGN typically uses cards in Stripe
    logStep("Payment methods configured", { paymentMethodTypes, currencyCode });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `${planData.plan_name} - ${planData.credits} Credits`,
              description: `Purchase ${planData.credits} credits for advanced features`,
            },
            unit_amount: Math.round(amount * 100), // Amount in cents/kobo/paisa
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: paymentMethodTypes,
      success_url: `${req.headers.get("origin")}/pricing?payment=success&credits=${planData.credits}&plan=${planId}`,
      cancel_url: `${req.headers.get("origin")}/pricing?payment=cancelled`,
      metadata: {
        userId: user.id,
        credits: planData.credits.toString(),
        planName: planData.plan_name,
        planId: planId,
        currencyCode: currencyCode,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
