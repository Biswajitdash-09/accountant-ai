import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('TrueLayer callback: Processing callback');
    
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      console.error('TrueLayer callback: Missing code or state', { code: !!code, state: !!state });
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'INVALID_REQUEST',
          message: 'Missing authorization code or state'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const clientId = Deno.env.get('TRUELAYER_CLIENT_ID');
    const clientSecret = Deno.env.get('TRUELAYER_CLIENT_SECRET');
    const redirectUri = Deno.env.get('TRUELAYER_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('TrueLayer callback: Missing credentials');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'CONFIG_ERROR',
          message: 'TrueLayer not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Use service role client to access oauth_states
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('TrueLayer callback: Validating state');

    // Validate state and get user_id
    const { data: stateData, error: stateError } = await supabaseClient
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('provider', 'truelayer')
      .is('used_at', null)
      .single();

    if (stateError || !stateData) {
      console.error('TrueLayer callback: Invalid or expired state', stateError);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'INVALID_STATE',
          message: 'Invalid or expired authorization state'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if state is expired (15 minutes)
    const stateAge = new Date().getTime() - new Date(stateData.created_at).getTime();
    if (stateAge > 15 * 60 * 1000) {
      console.error('TrueLayer callback: State expired');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'STATE_EXPIRED',
          message: 'Authorization state expired'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Mark state as used
    await supabaseClient
      .from('oauth_states')
      .update({ used_at: new Date().toISOString() })
      .eq('state', state);

    console.log(`TrueLayer callback: Exchanging code for token (user: ${stateData.user_id})`);

    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.truelayer.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('TrueLayer callback: Token exchange failed', errorText);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'TOKEN_EXCHANGE_FAILED',
          message: 'Failed to exchange authorization code',
          details: errorText.substring(0, 200)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();

    console.log('TrueLayer callback: Fetching account information');

    // Get account information
    const accountsResponse = await fetch('https://api.truelayer.com/data/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    let accountInfo: any = {};
    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      accountInfo = accountsData.results?.[0] || {};
      console.log('TrueLayer callback: Account info retrieved');
    } else {
      console.warn('TrueLayer callback: Failed to fetch account info');
    }

    console.log('TrueLayer callback: Storing connection in database');

    // Store connection in database
    const { error: dbError } = await supabaseClient
      .from('truelayer_connections')
      .insert({
        user_id: stateData.user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        account_id: accountInfo.account_id,
        account_type: accountInfo.account_type,
        provider_name: accountInfo.provider?.display_name,
        status: 'active',
      });

    if (dbError) {
      console.error('TrueLayer callback: Database error', dbError);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'DB_ERROR',
          message: 'Failed to store connection',
          details: dbError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('TrueLayer callback: Connection established successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TrueLayer connection established successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('TrueLayer callback: Unexpected error', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
