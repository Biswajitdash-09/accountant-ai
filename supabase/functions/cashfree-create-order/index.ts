
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CASHFREE-CREATE-ORDER] ${step}${detailsStr}`);
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

    const { planId, amount, currency = 'INR' } = await req.json();
    logStep("Request data", { planId, amount, currency });

    // Get Cashfree credentials
    const cashfreeAppId = Deno.env.get("CASHFREE_APP_ID");
    const cashfreeSecretKey = Deno.env.get("CASHFREE_SECRET_KEY");
    const cashfreeEnvironment = Deno.env.get("CASHFREE_ENVIRONMENT") || "sandbox"; // sandbox or production
    
    if (!cashfreeAppId || !cashfreeSecretKey) {
      throw new Error("Cashfree credentials not configured");
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Cashfree API endpoint
    const baseUrl = cashfreeEnvironment === "production" 
      ? "https://api.cashfree.com/pg" 
      : "https://sandbox.cashfree.com/pg";

    // Create order payload
    const orderPayload = {
      order_id: orderId,
      order_amount: parseFloat(amount).toFixed(2),
      order_currency: currency,
      customer_details: {
        customer_id: user.id,
        customer_name: user.user_metadata?.full_name || user.email.split('@')[0],
        customer_email: user.email,
        customer_phone: user.user_metadata?.phone || "9999999999"
      },
      order_meta: {
        return_url: `${req.headers.get("origin")}/pricing?payment=success&plan=${planId}`,
        notify_url: `${req.headers.get("origin")}/api/cashfree-webhook`
      },
      order_note: `Payment for plan: ${planId}`
    };

    logStep("Creating Cashfree order", orderPayload);

    // Call Cashfree API to create order
    const cashfreeResponse = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": cashfreeAppId,
        "x-client-secret": cashfreeSecretKey,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!cashfreeResponse.ok) {
      const errorText = await cashfreeResponse.text();
      logStep("Cashfree API error", { status: cashfreeResponse.status, error: errorText });
      throw new Error(`Cashfree API error: ${errorText}`);
    }

    const orderData = await cashfreeResponse.json();
    logStep("Cashfree order created", orderData);

    // Store payment record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: paymentData, error: paymentError } = await supabaseService
      .from('payments')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        currency: currency,
        status: 'pending',
        plan_id: planId,
        payment_method: 'upi',
        provider: 'cashfree',
        provider_order_id: orderId,
        provider_session_id: orderData.order_token || orderData.payment_session_id,
        payment_link: orderData.payment_link,
        metadata: {
          cashfree_order_data: orderData,
          customer_details: orderPayload.customer_details
        }
      })
      .select()
      .single();

    if (paymentError) {
      logStep("ERROR: Failed to store payment record", paymentError);
      throw new Error(`Failed to store payment: ${paymentError.message}`);
    }

    logStep("Payment record stored", { paymentId: paymentData.id });

    // Return the payment link or session token
    return new Response(JSON.stringify({
      success: true,
      orderId: orderId,
      paymentLink: orderData.payment_link,
      sessionToken: orderData.order_token || orderData.payment_session_id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-order", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
