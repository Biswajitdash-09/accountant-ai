import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function processes pending webhook deliveries
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("[WEBHOOK-DELIVERY] Processing pending webhook deliveries");

    // Get pending deliveries (max 10 at a time)
    const { data: pendingDeliveries, error: fetchError } = await supabase
      .from('webhook_deliveries')
      .select(`
        *,
        webhooks (*)
      `)
      .eq('status', 'pending')
      .lt('attempts', 3) // Max 3 retry attempts
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    if (!pendingDeliveries || pendingDeliveries.length === 0) {
      return new Response(JSON.stringify({
        message: "No pending deliveries",
        processed: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[WEBHOOK-DELIVERY] Found ${pendingDeliveries.length} pending deliveries`);

    const results = [];

    for (const delivery of pendingDeliveries) {
      try {
        const webhook = delivery.webhooks;
        
        if (!webhook || !webhook.is_active) {
          console.log(`[WEBHOOK-DELIVERY] Webhook ${delivery.webhook_id} is inactive, skipping`);
          continue;
        }

        // Create HMAC signature
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(delivery.payload));
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
        const startTime = Date.now();
        const webhookResponse = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signatureHex,
            'X-Webhook-Event': delivery.event_type,
            'X-Webhook-Delivery-Id': delivery.id,
          },
          body: JSON.stringify(delivery.payload),
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        const responseTime = Date.now() - startTime;
        const responseBody = await webhookResponse.text();

        // Update delivery status
        const updateData: any = {
          attempts: delivery.attempts + 1,
          http_status: webhookResponse.status,
          response_body: responseBody.substring(0, 1000),
        };

        if (webhookResponse.ok) {
          updateData.status = 'delivered';
          updateData.delivered_at = new Date().toISOString();
          console.log(`[WEBHOOK-DELIVERY] Successfully delivered to ${webhook.url} (${responseTime}ms)`);
        } else {
          updateData.status = delivery.attempts + 1 >= 3 ? 'failed' : 'pending';
          updateData.error_message = `HTTP ${webhookResponse.status}: ${responseBody.substring(0, 200)}`;
          console.log(`[WEBHOOK-DELIVERY] Failed delivery to ${webhook.url}: ${webhookResponse.status}`);
        }

        await supabase
          .from('webhook_deliveries')
          .update(updateData)
          .eq('id', delivery.id);

        results.push({
          delivery_id: delivery.id,
          webhook_url: webhook.url,
          success: webhookResponse.ok,
          status: webhookResponse.status,
          response_time: responseTime,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[WEBHOOK-DELIVERY] Error delivering webhook:`, errorMessage);

        // Update delivery with error
        await supabase
          .from('webhook_deliveries')
          .update({
            attempts: delivery.attempts + 1,
            status: delivery.attempts + 1 >= 3 ? 'failed' : 'pending',
            error_message: errorMessage.substring(0, 500),
          })
          .eq('id', delivery.id);

        results.push({
          delivery_id: delivery.id,
          success: false,
          error: errorMessage,
        });
      }
    }

    return new Response(JSON.stringify({
      message: "Webhook deliveries processed",
      processed: results.length,
      results: results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[WEBHOOK-DELIVERY] Error:", errorMessage);
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
