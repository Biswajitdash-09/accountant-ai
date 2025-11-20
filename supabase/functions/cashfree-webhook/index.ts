
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyCashfreeSignature, validateInput, cashfreeWebhookSchema } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CASHFREE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");
    
    logStep("Webhook data", { 
      bodyLength: body.length, 
      hasSignature: !!signature,
      timestamp 
    });

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // CRITICAL: Verify webhook signature to prevent fraud
    const cashfreeSecret = Deno.env.get("CASHFREE_WEBHOOK_SECRET");
    if (!cashfreeSecret) {
      logStep("ERROR: CASHFREE_WEBHOOK_SECRET not configured");
      throw new Error("Webhook secret not configured");
    }

    const isValidSignature = await verifyCashfreeSignature(
      body,
      signature,
      timestamp,
      cashfreeSecret
    );

    if (!isValidSignature) {
      logStep("ERROR: Invalid webhook signature", { signature, timestamp });
      
      // Log failed verification attempt
      await supabase.from('payment_webhook_logs').insert({
        provider: 'cashfree',
        raw_headers: Object.fromEntries(req.headers.entries()),
        payload: JSON.parse(body),
        signature: signature || '',
        status: 'signature_failed'
      });
      
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401 
        }
      );
    }

    logStep("Signature verified successfully");

    // Parse and validate webhook data
    const webhookData = JSON.parse(body);
    const validation = validateInput(cashfreeWebhookSchema, webhookData);
    
    if (!validation.success) {
      logStep("ERROR: Invalid webhook data", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    logStep("Webhook parsed and validated", webhookData);

    // Log the webhook for debugging
    await supabase.from('payment_webhook_logs').insert({
      provider: 'cashfree',
      raw_headers: Object.fromEntries(req.headers.entries()),
      payload: webhookData,
      signature: signature || '',
      status: 'verified'
    });

    // Handle different event types
    const { type: eventType, data } = webhookData;

    switch (eventType) {
      case 'PAYMENT_SUCCESS':
        logStep("Processing PAYMENT_SUCCESS");
        
        const { order } = data;
        const orderId = order.order_id;
        const paymentId = order.cf_payment_id;
        
        logStep("Payment success data", { orderId, paymentId });

        // Update payment status in database
        const { data: paymentRecord, error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            provider_payment_id: paymentId,
            metadata: {
              ...data,
              webhook_received_at: new Date().toISOString()
            }
          })
          .eq('provider_order_id', orderId)
          .select()
          .single();

        if (updateError) {
          logStep("ERROR: Failed to update payment", updateError);
          throw new Error(`Failed to update payment: ${updateError.message}`);
        }

        logStep("Payment updated", paymentRecord);

        // Add credits to user account if this is a credit purchase
        if (paymentRecord && paymentRecord.credits > 0) {
          const { error: creditsError } = await supabase
            .rpc('admin_add_credits', {
              p_user_id: paymentRecord.user_id,
              p_credits_to_add: paymentRecord.credits
            });

          if (creditsError) {
            logStep("ERROR: Failed to add credits", creditsError);
          } else {
            logStep("Credits added successfully", { 
              userId: paymentRecord.user_id, 
              credits: paymentRecord.credits 
            });
          }
        }

        break;

      case 'PAYMENT_FAILED':
        logStep("Processing PAYMENT_FAILED");
        
        const failedOrder = data.order;
        const failedOrderId = failedOrder.order_id;
        
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            metadata: {
              ...data,
              webhook_received_at: new Date().toISOString()
            }
          })
          .eq('provider_order_id', failedOrderId);

        logStep("Payment marked as failed", { orderId: failedOrderId });
        break;

      default:
        logStep("Unhandled event type", { type: eventType });
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
