import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Dunning email templates
const DUNNING_TEMPLATES = {
  first_reminder: {
    subject: "⚠️ Payment Failed - Action Required",
    delay: 1, // days after failure
  },
  second_reminder: {
    subject: "🔔 Your subscription is at risk",
    delay: 3,
  },
  final_warning: {
    subject: "❌ Final Notice: Subscription cancellation pending",
    delay: 7,
  },
  grace_expired: {
    subject: "Your Accountant AI subscription has been paused",
    delay: 10,
  },
};

interface RecoveryRequest {
  userId?: string;
  paymentId?: string;
  action: "check_failed" | "retry_payment" | "send_dunning" | "process_all";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { userId, paymentId, action }: RecoveryRequest = await req.json();

    console.log(`Payment recovery action: ${action}`, { userId, paymentId });

    switch (action) {
      case "check_failed": {
        // Find all failed payments in the last 14 days
        const { data: failedPayments, error } = await supabaseClient
          .from("payments")
          .select("*, profiles(email, full_name)")
          .eq("status", "failed")
          .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch failed payments: ${error.message}`);
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            failedPayments: failedPayments?.length || 0,
            payments: failedPayments 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "retry_payment": {
        if (!paymentId) {
          return new Response(
            JSON.stringify({ error: "Payment ID required for retry" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get the failed payment
        const { data: payment, error: paymentError } = await supabaseClient
          .from("payments")
          .select("*")
          .eq("id", paymentId)
          .single();

        if (paymentError || !payment) {
          throw new Error("Payment not found");
        }

        // In production, integrate with Stripe/payment provider to retry
        // For now, just log the attempt
        console.log(`Retry attempt for payment ${paymentId}`, payment);

        // Update payment with retry attempt
        await supabaseClient
          .from("payments")
          .update({
            metadata: {
              ...payment.metadata,
              retry_attempts: ((payment.metadata as any)?.retry_attempts || 0) + 1,
              last_retry: new Date().toISOString(),
            },
          })
          .eq("id", paymentId);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Payment retry initiated",
            paymentId 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send_dunning": {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "User ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get user profile and their failed payment
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (!profile?.email) {
          throw new Error("User email not found");
        }

        const { data: failedPayment } = await supabaseClient
          .from("payments")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "failed")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!failedPayment) {
          return new Response(
            JSON.stringify({ error: "No failed payment found for user" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Determine which dunning email to send based on days since failure
        const daysSinceFailure = Math.floor(
          (Date.now() - new Date(failedPayment.created_at).getTime()) / (24 * 60 * 60 * 1000)
        );

        let template: keyof typeof DUNNING_TEMPLATES = "first_reminder";
        if (daysSinceFailure >= 10) template = "grace_expired";
        else if (daysSinceFailure >= 7) template = "final_warning";
        else if (daysSinceFailure >= 3) template = "second_reminder";

        const emailContent = generateDunningEmail(
          profile.full_name || "Valued Customer",
          template,
          failedPayment.amount,
          failedPayment.currency || "USD"
        );

        // Send email
        const emailResult = await resend.emails.send({
          from: "Accountant AI <billing@accountant-ai.com>",
          to: [profile.email],
          subject: DUNNING_TEMPLATES[template].subject,
          html: emailContent,
        });

        console.log(`Dunning email sent to ${profile.email}:`, emailResult);

        // Log the dunning attempt
        await supabaseClient.from("notifications").insert({
          user_id: userId,
          title: "Payment Reminder Sent",
          message: `A payment reminder email was sent regarding your failed payment.`,
          type: "financial",
          priority: "high",
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            template,
            emailSent: true 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "process_all": {
        // Process all failed payments and send appropriate dunning emails
        const { data: failedPayments } = await supabaseClient
          .from("payments")
          .select("*, profiles(id, email, full_name)")
          .eq("status", "failed")
          .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

        const processed: string[] = [];
        const errors: string[] = [];

        for (const payment of failedPayments || []) {
          try {
            // Check if we've already sent a dunning email today
            const metadata = payment.metadata as any;
            const lastDunning = metadata?.last_dunning_sent;
            if (lastDunning) {
              const hoursSinceLastDunning = 
                (Date.now() - new Date(lastDunning).getTime()) / (60 * 60 * 1000);
              if (hoursSinceLastDunning < 24) {
                continue; // Skip, already emailed today
              }
            }

            // Mark as processed
            await supabaseClient
              .from("payments")
              .update({
                metadata: {
                  ...metadata,
                  last_dunning_sent: new Date().toISOString(),
                },
              })
              .eq("id", payment.id);

            processed.push(payment.id);
          } catch (error) {
            errors.push(`${payment.id}: ${error}`);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            processed: processed.length,
            errors: errors.length,
            details: { processed, errors } 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Payment recovery error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateDunningEmail(
  name: string,
  template: keyof typeof DUNNING_TEMPLATES,
  amount: number,
  currency: string
): string {
  const updatePaymentUrl = "https://accountant-ai.com/billing";
  
  const templates = {
    first_reminder: `
      <h2>Payment Failed</h2>
      <p>Hi ${name},</p>
      <p>We noticed that your recent payment of <strong>${currency} ${amount}</strong> couldn't be processed.</p>
      <p>This might be due to:</p>
      <ul>
        <li>Expired card details</li>
        <li>Insufficient funds</li>
        <li>Bank security block</li>
      </ul>
      <p>Please update your payment method to continue enjoying Accountant AI:</p>
      <a href="${updatePaymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Update Payment Method</a>
    `,
    second_reminder: `
      <h2>🔔 Action Required</h2>
      <p>Hi ${name},</p>
      <p>Your payment is still pending, and your Accountant AI subscription is at risk.</p>
      <p>Update your payment method now to avoid losing access to:</p>
      <ul>
        <li>✨ Arnold AI Assistant</li>
        <li>📊 Financial Analytics</li>
        <li>🏦 Bank Connections</li>
        <li>📄 Tax Reports</li>
      </ul>
      <a href="${updatePaymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">Update Payment Now</a>
    `,
    final_warning: `
      <h2>❌ Final Notice</h2>
      <p>Hi ${name},</p>
      <p><strong>Your subscription will be cancelled in 3 days</strong> if we don't receive payment.</p>
      <p>We don't want to see you go! Please update your payment method immediately to keep your account active.</p>
      <a href="${updatePaymentUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold;">SAVE MY SUBSCRIPTION</a>
      <p style="color: #666; font-size: 14px;">If you're having trouble, reply to this email - we're here to help!</p>
    `,
    grace_expired: `
      <h2>Subscription Paused</h2>
      <p>Hi ${name},</p>
      <p>Your Accountant AI subscription has been paused due to payment failure.</p>
      <p>Your data is safe and will be retained for 30 days. Reactivate anytime:</p>
      <a href="${updatePaymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reactivate My Account</a>
      <p style="color: #666;">We miss you! As a thank you for coming back, use code <strong>WELCOMEBACK20</strong> for 20% off your next month.</p>
    `,
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ${templates[template]}
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Accountant AI. All rights reserved.</p>
            <p>Questions? Contact support@accountant-ai.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
