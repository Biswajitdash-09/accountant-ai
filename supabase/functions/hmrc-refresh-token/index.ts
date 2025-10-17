import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const HMRC_CLIENT_ID = Deno.env.get('HMRC_CLIENT_ID');
    const HMRC_CLIENT_SECRET = Deno.env.get('HMRC_CLIENT_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get current token
    const { data: tokenData, error: tokenError } = await supabase
      .from('hmrc_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('No token found');
    }

    console.log('Refreshing HMRC token...');

    // Refresh token with HMRC
    const refreshResponse = await fetch('https://test-api.service.hmrc.gov.uk/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refresh_token,
        client_id: HMRC_CLIENT_ID!,
        client_secret: HMRC_CLIENT_SECRET!,
      }),
    });

    if (!refreshResponse.ok) {
      const error = await refreshResponse.text();
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh token');
    }

    const newTokens = await refreshResponse.json();
    const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();

    // Update token
    const { error: updateError } = await supabase
      .from('hmrc_tokens')
      .update({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token || tokenData.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
      throw updateError;
    }

    console.log('Token refreshed successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in hmrc-refresh-token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
