import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaitlistSignupRequest {
  email: string;
  full_name?: string;
  company_name?: string;
  referral_source?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

    const { email, full_name, company_name, referral_source }: WaitlistSignupRequest = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Block disposable email domains
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com'];
    const emailDomain = email.split('@')[1].toLowerCase();
    if (disposableDomains.includes(emailDomain)) {
      return new Response(
        JSON.stringify({ error: 'Disposable email addresses are not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id, position')
      .eq('email', email)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          message: 'Already on waitlist', 
          position: existing.position,
          isExisting: true 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert into waitlist
    const { data: waitlistEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert({
        email,
        full_name,
        company_name,
        referral_source: referral_source || 'direct',
        status: 'pending',
      })
      .select('id, position')
      .single();

    if (insertError) {
      console.error('Error inserting into waitlist:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to join waitlist' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Accountant AI <onboarding@resend.dev>',
        to: [email],
        subject: '🎉 You\'re on the Waitlist for Accountant AI!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; }
                .position-badge { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 15px 30px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
                .feature { margin: 15px 0; padding-left: 25px; position: relative; }
                .feature:before { content: "✓"; position: absolute; left: 0; color: #3b82f6; font-weight: bold; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">🎉 Welcome to Accountant AI!</h1>
                </div>
                <div class="content">
                  <p>Hi${full_name ? ` ${full_name}` : ''},</p>
                  
                  <p>You're officially on the waitlist for Accountant AI - the future of AI-powered accounting!</p>
                  
                  <div class="position-badge">
                    You're #${waitlistEntry.position} in line
                  </div>
                  
                  <p><strong>Total on waitlist: ${totalCount}</strong></p>
                  
                  <h3>🌟 What to expect:</h3>
                  <div class="feature">Priority access when we launch</div>
                  <div class="feature">Exclusive 30% launch discount</div>
                  <div class="feature">100 bonus AI credits</div>
                  <div class="feature">Personal onboarding session</div>
                  <div class="feature">Direct line to our founding team</div>
                  
                  <p>We're working hard to launch soon. You'll be the first to know!</p>
                  
                  <p>Meanwhile, check out what we're building:</p>
                  <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', '')}" class="cta-button">Explore Demo</a>
                  
                  <p style="margin-top: 30px;">Questions? Just reply to this email.</p>
                  
                  <p>Best,<br>The Accountant AI Team</p>
                  
                  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    <strong>P.S.</strong> Know someone who'd love this? Forward this email and help them skip ahead in line!
                  </p>
                </div>
                <div class="footer">
                  © 2025 Accountant AI. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist',
        position: waitlistEntry.position,
        totalCount,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in waitlist-signup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});