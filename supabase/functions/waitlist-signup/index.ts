import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";
import { waitlistConfirmationEmail } from "../_shared/emailTemplates.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SurveyResponses {
  user_type?: string;
  stress_level?: string;
  pain_points?: string[];
  value_rating?: string;
  pricing_preference?: string;
  urgency_triggers?: string[];
  notification_preferences?: string[];
}

interface WaitlistSignupRequest {
  email: string;
  full_name?: string;
  company_name?: string;
  referral_source?: string;
  survey_responses?: SurveyResponses;
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

    const { email, full_name, company_name, referral_source, survey_responses }: WaitlistSignupRequest = await req.json();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Block disposable email domains
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com', 'temp-mail.org', 'fakeinbox.com'];
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

    // Build metadata with survey responses
    const metadata: Record<string, unknown> = {};
    if (survey_responses) {
      metadata.survey_completed = true;
      metadata.survey_responses = survey_responses;
      metadata.survey_completed_at = new Date().toISOString();
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
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
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

    // Send confirmation email using shared template
    let emailSent = false;
    try {
      console.log('Attempting to send confirmation email to:', email);
      
      const emailHtml = waitlistConfirmationEmail({
        fullName: full_name,
        position: waitlistEntry.position,
        totalCount: totalCount || waitlistEntry.position,
        surveyResponses: survey_responses,
      });

      const emailResult = await resend.emails.send({
        from: 'Accountant AI <onboarding@resend.dev>',
        to: [email],
        subject: '🎉 You\'re on the Waitlist for Accountant AI!',
        html: emailHtml,
      });
      
      if (emailResult.error) {
        console.error('Resend API error:', JSON.stringify(emailResult.error));
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