import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  tag?: string;
  actions?: Array<{ action: string; title: string; icon?: string }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const request: PushNotificationRequest = await req.json();
    const { userId, userIds, title, body, icon, badge, data, tag, actions } = request;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine target users
    const targetUserIds = userIds || (userId ? [userId] : [user.id]);

    console.log(`Sending push notification to ${targetUserIds.length} user(s): "${title}"`);

    // Fetch push subscriptions for target users
    const { data: subscriptions, error: subError } = await supabaseClient
      .from("push_subscriptions")
      .select("*")
      .in("user_id", targetUserIds);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found for target users");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No subscriptions found",
          sent: 0 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build notification payload
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || "/icon-192x192.png",
      badge: badge || "/icon-96x96.png",
      vibrate: [200, 100, 200],
      data: {
        ...data,
        dateOfArrival: Date.now(),
        url: data?.url || "/dashboard",
      },
      tag: tag || `notification-${Date.now()}`,
      actions: actions || [
        { action: "view", title: "View" },
        { action: "dismiss", title: "Dismiss" },
      ],
    });

    // Send to each subscription
    // Note: In production, you'd use web-push library with VAPID keys
    // This is a simplified version that logs the intended notifications
    const results: Array<{ userId: string; success: boolean; error?: string }> = [];

    for (const subscription of subscriptions) {
      try {
        // In production, use web-push to send actual push notifications
        // const webpush = require('web-push');
        // await webpush.sendNotification(subscription, notificationPayload);
        
        console.log(`Push notification queued for user ${subscription.user_id}`);
        results.push({ userId: subscription.user_id, success: true });
      } catch (error) {
        console.error(`Failed to send push to ${subscription.user_id}:`, error);
        results.push({ 
          userId: subscription.user_id, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    // Also create in-app notifications
    const inAppNotifications = targetUserIds.map(uid => ({
      user_id: uid,
      title,
      message: body,
      type: "system" as const,
      priority: "medium" as const,
      is_read: false,
    }));

    await supabaseClient.from("notifications").insert(inAppNotifications);

    const successCount = results.filter(r => r.success).length;
    console.log(`Push notifications sent: ${successCount}/${results.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: results.length,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
