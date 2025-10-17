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
    const { code, state } = await req.json();
    
    if (!code) {
      throw new Error('Authorization code not provided');
    }

    const HMRC_CLIENT_ID = Deno.env.get('HMRC_CLIENT_ID');
    const HMRC_CLIENT_SECRET = Deno.env.get('HMRC_CLIENT_SECRET');
    const HMRC_REDIRECT_URI = Deno.env.get('HMRC_REDIRECT_URI');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://test-api.service.hmrc.gov.uk/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: HMRC_REDIRECT_URI!,
        client_id: HMRC_CLIENT_ID!,
        client_secret: HMRC_CLIENT_SECRET!,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('HMRC token exchange failed:', error);
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained HMRC tokens');

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Store connection
    const { data: connection, error: connError } = await supabase
      .from('hmrc_connections')
      .insert({
        user_id: user.id,
        connection_status: 'active',
        scopes: tokens.scope?.split(' ') || [],
        hmrc_account_id: 'temp_' + user.id,
        expires_at: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { connected_at: new Date().toISOString() }
      })
      .select()
      .single();

    if (connError) {
      console.error('Error storing connection:', connError);
      throw connError;
    }

    // Store tokens (encrypted by database)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    
    const { error: tokenError } = await supabase
      .from('hmrc_tokens')
      .insert({
        user_id: user.id,
        connection_id: connection.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      });

    if (tokenError) {
      console.error('Error storing tokens:', tokenError);
      throw tokenError;
    }

    console.log('HMRC connection established successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        connectionId: connection.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in hmrc-callback:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
