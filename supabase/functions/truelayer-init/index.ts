import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('TrueLayer init: Starting initialization');
    
    const clientId = Deno.env.get('TRUELAYER_CLIENT_ID');
    const redirectUri = Deno.env.get('TRUELAYER_REDIRECT_URI');

    if (!clientId || !redirectUri) {
      console.error('TrueLayer init: Credentials not configured', { clientId: !!clientId, redirectUri: !!redirectUri });
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'CONFIG_ERROR',
          message: 'TrueLayer not configured',
          details: 'Missing client ID or redirect URI'
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('TrueLayer init: Missing authorization header');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'AUTH_ERROR',
          message: 'Missing authorization header'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('TrueLayer init: User authentication failed', userError);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`TrueLayer init: Initiating connection for user ${user.id}`);

    // Generate state parameter for security
    const state = crypto.randomUUID();

    // Store state in oauth_states table
    const { error: stateError } = await supabaseClient
      .from('oauth_states')
      .insert({
        state,
        user_id: user.id,
        provider: 'truelayer'
      });

    if (stateError) {
      console.error('TrueLayer init: Failed to store state', stateError);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'DB_ERROR',
          message: 'Failed to initialize OAuth flow',
          details: stateError.message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Build authorization URL
    const authUrl = new URL('https://auth.truelayer.com/');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'info accounts balance transactions offline_access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('providers', 'uk-ob-all uk-oauth-all');

    console.log('TrueLayer init: Successfully generated auth URL');

    return new Response(
      JSON.stringify({
        success: true,
        authUrl: authUrl.toString(),
        state,
        message: 'TrueLayer authorization URL generated'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('TrueLayer init: Unexpected error', error);
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
