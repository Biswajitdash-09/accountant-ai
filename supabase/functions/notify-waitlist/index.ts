import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyRequest {
  batchSize?: number;
  startPosition?: number;
  endPosition?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role_type')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const isAdmin = roles?.some(r => r.role_type === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
    const { batchSize = 100, startPosition, endPosition }: NotifyRequest = await req.json();

    // Build query
    let query = supabase
      .from('waitlist')
      .select('*')
      .eq('status', 'pending')
      .order('position', { ascending: true });

    if (startPosition !== undefined) {
      query = query.gte('position', startPosition);
    }
    if (endPosition !== undefined) {
      query = query.lte('position', endPosition);
    }

    query = query.limit(batchSize);

    const { data: waitlistEntries, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching waitlist:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch waitlist' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending waitlist entries found', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get total count for messaging
    const { count: totalCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    let successCount = 0;
    let failureCount = 0;

    // Send emails in batches
    for (const entry of waitlistEntries) {
      try {
        await resend.emails.send({
          from: 'Accountant AI <onboarding@resend.dev>',
          to: [entry.email],
          subject: '🚀 Accountant AI is LIVE - Your Early Access Awaits!',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; }
                  .badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 10px 0; }
                  .benefit { margin: 15px 0; padding-left: 30px; position: relative; font-size: 16px; }
                  .benefit:before { content: "✨"; position: absolute; left: 0; font-size: 20px; }
                  .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; }
                  .coupon-code { background: #fef3c7; border: 2px dashed #f59e0b; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
                  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                  .urgency { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">🚀 We're Live!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px;">Your wait is over - Accountant AI is officially here</p>
                  </div>
                  <div class="content">
                    <p>Hi${entry.full_name ? ` ${entry.full_name}` : ''},</p>
                    
                    <p style="font-size: 18px;"><strong>The moment you've been waiting for has arrived!</strong></p>
                    
                    <p>As waitlist member <strong>#${entry.position}</strong> (out of ${totalCount}), you get exclusive early access benefits:</p>
                    
                    <div class="benefit">30% off your first 3 months</div>
                    <div class="benefit">100 bonus AI credits (worth $50)</div>
                    <div class="benefit">Priority support for 90 days</div>
                    <div class="benefit">Free personal onboarding call</div>
                    
                    <div class="coupon-code">
                      <p style="margin: 0; font-size: 14px; color: #92400e;">Your exclusive launch code:</p>
                      <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold; color: #92400e; letter-spacing: 2px;">EARLY30</p>
                    </div>
                    
                    <div style="text-align: center;">
                      <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', '')}/auth" class="cta-button">
                        🎯 Claim Your Early Access →
                      </a>
                    </div>
                    
                    <div class="urgency">
                      <p style="margin: 0; font-weight: bold; color: #dc2626;">⏰ This offer expires in 48 hours!</p>
                      <p style="margin: 10px 0 0 0; font-size: 14px; color: #991b1b;">Don't miss out on your exclusive benefits</p>
                    </div>
                    
                    <p>Thank you for believing in us from day one. We can't wait to help you transform your accounting!</p>
                    
                    <p>Best,<br>The Accountant AI Team</p>
                  </div>
                  <div class="footer">
                    © 2025 Accountant AI. All rights reserved.<br>
                    Your waitlist position: #${entry.position} | Total on waitlist: ${totalCount}
                  </div>
                </div>
              </body>
            </html>
          `,
        });

        // Update status
        await supabase
          .from('waitlist')
          .update({ 
            status: 'notified', 
            notified_at: new Date().toISOString() 
          })
          .eq('id', entry.id);

        successCount++;
        
        // Add small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (emailError) {
        console.error(`Error sending email to ${entry.email}:`, emailError);
        failureCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notified ${successCount} users`,
        successCount,
        failureCount,
        totalProcessed: waitlistEntries.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-waitlist:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});