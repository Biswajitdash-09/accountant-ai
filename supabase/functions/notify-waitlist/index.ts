import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@4.0.0";
import { launchNotificationEmail } from "../_shared/emailTemplates.ts";

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

    // Get app URL from environment
    const appUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app') || 'https://accountant-ai.com';

    let successCount = 0;
    let failureCount = 0;

    // Send emails in batches
    for (const entry of waitlistEntries) {
      try {
        const emailHtml = launchNotificationEmail({
          fullName: entry.full_name,
          position: entry.position,
          totalCount: totalCount || 0,
          appUrl,
        });

        await resend.emails.send({
          from: 'Accountant AI <onboarding@resend.dev>',
          to: [entry.email],
          subject: '🚀 Accountant AI is LIVE - Your Early Access Awaits!',
          html: emailHtml,
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