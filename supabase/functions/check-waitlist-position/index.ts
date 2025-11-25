import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user's position
    const { data: entry, error: entryError } = await supabase
      .from('waitlist')
      .select('position, status, created_at')
      .eq('email', email)
      .single();

    if (entryError || !entry) {
      return new Response(
        JSON.stringify({ error: 'Email not found on waitlist' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    // Calculate estimated launch date (example: 30 days from now)
    const estimatedLaunch = new Date();
    estimatedLaunch.setDate(estimatedLaunch.getDate() + 30);

    return new Response(
      JSON.stringify({
        position: entry.position,
        totalCount,
        status: entry.status,
        joinedAt: entry.created_at,
        estimatedLaunch: estimatedLaunch.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-waitlist-position:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});