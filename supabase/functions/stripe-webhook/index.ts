
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("ERROR: No stripe signature found");
      throw new Error("No stripe signature found");
    }

    const body = await req.text();
    logStep("Request body received", { bodyLength: body.length });

    // Verify webhook signature for security
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured");
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    let event;
    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Event verified and parsed", { type: event.type, id: event.id });
    } catch (err) {
      logStep("ERROR: Webhook signature verification failed", { error: err.message });
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        logStep("Processing checkout.session.completed");
        
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || "0");
        const planName = session.metadata?.planName;
        
        logStep("Session data", { 
          sessionId: session.id,
          userId,
          credits,
          planName,
          amount: session.amount_total,
          currency: session.currency 
        });

        if (!userId || !credits) {
          logStep("ERROR: Missing required metadata", { userId, credits });
          throw new Error("Missing required metadata");
        }

        // Add credits to user account
        const { data: creditsResult, error: creditsError } = await supabase
          .rpc('add_credits', {
            user_id: userId,
            credits_to_add: credits
          });

        if (creditsError) {
          logStep("ERROR: Failed to add credits", { error: creditsError });
          throw new Error(`Failed to add credits: ${creditsError.message}`);
        }

        logStep("Credits added successfully", { creditsResult });

        // Log payment in payments table
        const { data: paymentData, error: paymentError } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total / 100, // Convert from cents
            currency: session.currency,
            credits: credits,
            status: 'paid',
            plan_id: session.metadata?.planId || 'unknown',
            plan_name: planName,
            payment_method: session.payment_method_types?.[0] || 'unknown',
            metadata: {
              customer_email: session.customer_email,
              customer_id: session.customer,
              payment_status: session.payment_status
            }
          });

        if (paymentError) {
          logStep("ERROR: Failed to log payment", { error: paymentError });
          // Don't throw here as credits were already added
        } else {
          logStep("Payment logged successfully", { paymentData });
        }

        break;

      case 'checkout.session.async_payment_failed':
        logStep("Processing checkout.session.async_payment_failed");
        
        const failedSession = event.data.object;
        const failedUserId = failedSession.metadata?.userId;
        
        if (failedUserId) {
          // Update payment status to failed
          const { error: updateError } = await supabase
            .from('payments')
            .update({
              status: 'failed',
              failure_reason: 'async_payment_failed'
            })
            .eq('stripe_session_id', failedSession.id);

          if (updateError) {
            logStep("ERROR: Failed to update payment status", { error: updateError });
          } else {
            logStep("Payment status updated to failed");
          }
        }
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
