import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YodleeTokenResponse {
  token: {
    accessToken: string;
    issuedAt: string;
    expiresIn: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Get Yodlee credentials
    const clientId = Deno.env.get('YODLEE_CLIENT_ID');
    const secret = Deno.env.get('YODLEE_SECRET');
    const baseUrl = Deno.env.get('YODLEE_BASE_URL');

    if (!clientId || !secret || !baseUrl) {
      console.error('Yodlee credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Yodlee not configured. Please contact administrator.' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Get user from auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
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
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Initiating Yodlee connection for user: ${user.id}`);

    // Get access token from Yodlee
    const tokenResponse = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': '1.1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': clientId,
      },
      body: new URLSearchParams({
        clientId,
        secret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Yodlee token error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get Yodlee access token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const tokenData: YodleeTokenResponse = await tokenResponse.json();
    console.log('Yodlee token obtained successfully');

    // Generate FastLink token for the user
    const fastLinkResponse = await fetch(`${baseUrl}/user/accessTokens?accessToken=Bearer`, {
      method: 'GET',
      headers: {
        'Api-Version': '1.1',
        'Authorization': `Bearer ${tokenData.token.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!fastLinkResponse.ok) {
      const errorText = await fastLinkResponse.text();
      console.error('FastLink token error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate FastLink token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const fastLinkData = await fastLinkResponse.json();
    console.log('FastLink token generated successfully');

    // Return the FastLink URL and token
    return new Response(
      JSON.stringify({
        success: true,
        fastLinkUrl: `${baseUrl}/authenticate/restserver/fastlink`,
        accessToken: fastLinkData.user.accessTokens[0].value,
        baseUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Yodlee init error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
