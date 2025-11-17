import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) throw new Error("Authentication failed");

    const { webhook_id } = await req.json();
    const userId = userData.user.id;

    console.log("[WEBHOOK-TEST] Testing webhook:", webhook_id);

    // Get webhook details
    const { data: webhook, error: webhookError } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhook_id)
      .eq('user_id', userId)
      .single();

    if (webhookError || !webhook) {
      throw new Error("Webhook not found");
    }

    // Test payload
    const testPayload = {
      event: "test.ping",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook delivery",
        webhook_id: webhook_id,
      }
    };

    // Create HMAC signature
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(testPayload));
    const keyData = encoder.encode(webhook.secret);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Send webhook
    const webhookResponse = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signatureHex,
        'X-Webhook-Event': 'test.ping',
      },
      body: JSON.stringify(testPayload),
    });

    const responseBody = await webhookResponse.text();

    // Log delivery
    await supabase
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhook_id,
        event_type: 'test.ping',
        payload: testPayload,
        status: webhookResponse.ok ? 'delivered' : 'failed',
        http_status: webhookResponse.status,
        response_body: responseBody.substring(0, 1000), // Limit size
        attempts: 1,
        delivered_at: webhookResponse.ok ? new Date().toISOString() : null,
        error_message: webhookResponse.ok ? null : `HTTP ${webhookResponse.status}: ${responseBody.substring(0, 200)}`,
      });

    return new Response(JSON.stringify({
      success: webhookResponse.ok,
      status: webhookResponse.status,
      message: webhookResponse.ok 
        ? "Test webhook delivered successfully" 
        : "Test webhook delivery failed",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[WEBHOOK-TEST] Error:", errorMessage);
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
