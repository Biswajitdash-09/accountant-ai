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
    let emailSent = false;
    try {
      console.log('Attempting to send confirmation email to:', email);
      
      const emailResult = await resend.emails.send({
        from: 'Accountant AI <onboarding@resend.dev>',
        to: [email],
        subject: '🎉 You\'re on the Waitlist for Accountant AI!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 16px 16px 0 0;">
                  <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Accountant AI!</h1>
                </div>
                <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <p style="font-size: 16px;">Hi${full_name ? ` ${full_name}` : ''},</p>
                  
                  <p style="font-size: 16px;">You're officially on the waitlist for <strong>Accountant AI</strong> - the future of AI-powered accounting!</p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 20px 40px; border-radius: 12px; display: inline-block;">
                      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your Position</p>
                      <p style="margin: 5px 0; font-size: 48px; font-weight: bold;">#${waitlistEntry.position}</p>
                      <p style="margin: 0; font-size: 14px; opacity: 0.9;">of ${totalCount} people waiting</p>
                    </div>
                  </div>
                  
                  <h3 style="color: #1f2937; margin-top: 30px;">🌟 What you'll get:</h3>
                  <ul style="padding-left: 20px;">
                    <li style="margin: 10px 0;">✅ Priority access when we launch</li>
                    <li style="margin: 10px 0;">✅ Exclusive 30% launch discount</li>
                    <li style="margin: 10px 0;">✅ 100 bonus AI credits</li>
                    <li style="margin: 10px 0;">✅ Personal onboarding session</li>
                    <li style="margin: 10px 0;">✅ Direct line to our founding team</li>
                  </ul>
                  
                  <p style="font-size: 16px; margin-top: 30px;">We're working hard to launch soon. You'll be the first to know!</p>
                  
                  <p style="margin-top: 30px;">Questions? Just reply to this email.</p>
                  
                  <p>Best,<br><strong>The Accountant AI Team</strong></p>
                </div>
                <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                  © 2026 Accountant AI. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `,
      });
      
      if (emailResult.error) {
        console.error('Resend API error:', JSON.stringify(emailResult.error));
        // Check if it's a domain verification issue
        if (emailResult.error.message?.includes('verify a domain')) {
          console.log('Note: Domain not verified - emails only work for account owner');
        }
      } else {
        console.log('Email sent successfully:', emailResult.data?.id);
        emailSent = true;
      }
    } catch (emailError: any) {
      console.error('Error sending confirmation email:', emailError?.message || emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully joined waitlist',
        position: waitlistEntry.position,
        totalCount,
        emailSent,
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