import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YodleeUserResponse {
  user: {
    id: string;
    loginName: string;
  };
}

interface YodleeAccessTokenResponse {
  accessToken: {
    value: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const clientId = Deno.env.get('YODLEE_CLIENT_ID');
    const secret = Deno.env.get('YODLEE_SECRET');
    const baseUrl = Deno.env.get('YODLEE_BASE_URL') || 'https://sandbox.api.yodlee.com/ysl';

    console.log('Yodlee init - checking credentials...');
    console.log('Client ID present:', !!clientId);
    console.log('Secret present:', !!secret);
    console.log('Base URL:', baseUrl);

    if (!clientId || !secret) {
      console.error('Yodlee credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Yodlee credentials not configured',
          details: {
            clientId: !!clientId,
            secret: !!secret
          }
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

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
        JSON.stringify({ 
          error: 'Authentication failed',
          details: userError?.message || 'No user found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Initiating Yodlee connection for user: ${user.id}`);

    // Step 1: Get admin access token
    const adminTokenResponse = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': '1.1',
        'Content-Type': 'application/json',
        'loginName': clientId,
      },
      body: JSON.stringify({
        clientId,
        secret,
      }),
    });

    if (!adminTokenResponse.ok) {
      const errorText = await adminTokenResponse.text();
      console.error('Yodlee admin token error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get Yodlee admin access token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const adminTokenData = await adminTokenResponse.json();
    const adminToken = adminTokenData.token?.accessToken;
    
    if (!adminToken) {
      console.error('No admin token in response');
      return new Response(
        JSON.stringify({ error: 'Invalid admin token response' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Yodlee admin token obtained');

    // Step 2: Register or get Yodlee user
    const yodleeLoginName = `user_${user.id}`;
    
    let yodleeUserId: string;
    let userToken: string;

    // Try to register new user
    const registerResponse = await fetch(`${baseUrl}/user/register`, {
      method: 'POST',
      headers: {
        'Api-Version': '1.1',
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          loginName: yodleeLoginName,
          email: user.email,
        },
      }),
    });

    if (registerResponse.ok) {
      const registerData: YodleeUserResponse = await registerResponse.json();
      yodleeUserId = registerData.user.id;
      console.log('New Yodlee user registered:', yodleeUserId);
    } else {
      // User might already exist, get their token
      const tokenResponse = await fetch(`${baseUrl}/user/accessTokens?loginName=${yodleeLoginName}`, {
        method: 'GET',
        headers: {
          'Api-Version': '1.1',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Failed to get existing user token:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to initialize Yodlee user' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const tokenData: YodleeAccessTokenResponse = await tokenResponse.json();
      userToken = tokenData.accessToken.value;
      console.log('Retrieved existing Yodlee user token');
    }

    // Step 3: Generate user access token if we just registered
    if (!userToken) {
      const userTokenResponse = await fetch(`${baseUrl}/user/accessTokens?loginName=${yodleeLoginName}`, {
        method: 'GET',
        headers: {
          'Api-Version': '1.1',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!userTokenResponse.ok) {
        const errorText = await userTokenResponse.text();
        console.error('User token error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to generate user token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const userTokenData: YodleeAccessTokenResponse = await userTokenResponse.json();
      userToken = userTokenData.accessToken.value;
    }

    // Store connection in database
    const { error: dbError } = await supabaseClient
      .from('yodlee_connections')
      .upsert({
        user_id: user.id,
        yodlee_user_id: yodleeLoginName,
        access_token: userToken,
        status: 'active',
      }, {
        onConflict: 'user_id,yodlee_user_id'
      });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    // Return FastLink configuration
    return new Response(
      JSON.stringify({
        success: true,
        fastLinkUrl: `${baseUrl}/authenticate/restserver/fastlink`,
        accessToken: userToken,
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
