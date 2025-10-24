import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YodleeUserResponse {
  user?: {
    id: string;
    loginName: string;
  };
}

interface YodleeAccessTokenResponse {
  token?: {
    accessToken: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('Yodlee init: Starting initialization');
    
    const clientId = Deno.env.get('YODLEE_CLIENT_ID');
    const secret = Deno.env.get('YODLEE_SECRET');
    const baseUrl = Deno.env.get('YODLEE_BASE_URL') || 'https://sandbox.api.yodlee.uk/ysl';

    if (!clientId || !secret) {
      console.error('Yodlee init: Missing credentials', { clientId: !!clientId, secret: !!secret });
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'CONFIG_ERROR',
          message: 'Yodlee credentials not configured',
          details: 'Missing client ID or secret'
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Yodlee init: Missing authorization header');
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
      console.error('Yodlee init: User authentication failed', userError);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Yodlee init: Processing for user ${user.id}`);

    // Step 1: Get admin access token
    console.log('Yodlee init: Requesting admin token');
    const adminTokenResponse = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Api-Version': '1.1',
        'loginName': clientId,
      },
      body: `clientId=${encodeURIComponent(clientId)}&secret=${encodeURIComponent(secret)}`,
    });

    if (!adminTokenResponse.ok) {
      const errorText = await adminTokenResponse.text();
      console.error('Yodlee init: Admin token request failed', errorText.substring(0, 200));
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'ADMIN_TOKEN_FAILED',
          message: 'Failed to obtain Yodlee admin token',
          details: errorText.substring(0, 200)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const adminTokenData = await adminTokenResponse.json();
    const adminToken = adminTokenData.token?.accessToken;

    if (!adminToken) {
      console.error('Yodlee init: Admin token not found in response');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'ADMIN_TOKEN_MISSING',
          message: 'Admin token not found in Yodlee response'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Yodlee init: Admin token obtained');

    // Step 2: Register or get user
    const loginName = `user_${user.id}`;
    console.log(`Yodlee init: Registering/getting Yodlee user ${loginName}`);
    
    const registerResponse = await fetch(`${baseUrl}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Version': '1.1',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        user: {
          loginName,
          email: user.email,
        },
      }),
    });

    let yodleeUserId: string;
    let userToken: string;

    if (registerResponse.ok) {
      const registerData: YodleeUserResponse = await registerResponse.json();
      yodleeUserId = registerData.user?.id || '';
      console.log(`Yodlee init: User registered with ID ${yodleeUserId}`);
      // Get user access token
      console.log('Yodlee init: Requesting user token');
      const userTokenResponse = await fetch(`${baseUrl}/user/accessTokens?loginName=${encodeURIComponent(loginName)}`, {
        method: 'GET',
        headers: {
          'Api-Version': '1.1',
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!userTokenResponse.ok) {
        const errorText = await userTokenResponse.text();
        console.error('Yodlee init: User token request failed', errorText.substring(0, 200));
        return new Response(
          JSON.stringify({ 
            success: false,
            code: 'USER_TOKEN_FAILED',
            message: 'Failed to obtain user access token',
            details: errorText.substring(0, 200)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const userTokenData: YodleeAccessTokenResponse = await userTokenResponse.json();
      userToken = userTokenData.token?.accessToken || '';

      if (!userToken) {
        console.error('Yodlee init: User token not found in response');
        return new Response(
          JSON.stringify({ 
            success: false,
            code: 'USER_TOKEN_MISSING',
            message: 'User token not found in Yodlee response'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } else {
      const errorData = await registerResponse.json();
      
      // User might already exist, try to get access token
      if (errorData.errorCode === 'Y800') {
        console.log('Yodlee init: User already exists, fetching token');
        const userTokenResponse = await fetch(`${baseUrl}/user/accessTokens?loginName=${encodeURIComponent(loginName)}`, {
          method: 'GET',
          headers: {
            'Api-Version': '1.1',
            'Authorization': `Bearer ${adminToken}`,
          },
        });

        if (!userTokenResponse.ok) {
          const errorText = await userTokenResponse.text();
          console.error('Yodlee init: User token request failed', errorText.substring(0, 200));
          return new Response(
            JSON.stringify({ 
              success: false,
              code: 'USER_TOKEN_FAILED',
              message: 'Failed to obtain user access token',
              details: errorText.substring(0, 200)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }

        const userTokenData: YodleeAccessTokenResponse = await userTokenResponse.json();
        userToken = userTokenData.token?.accessToken || '';
        yodleeUserId = loginName;
      } else {
        console.error('Yodlee init: User registration failed', JSON.stringify(errorData).substring(0, 200));
        return new Response(
          JSON.stringify({ 
            success: false,
            code: 'USER_REGISTRATION_FAILED',
            message: 'Failed to register Yodlee user',
            details: JSON.stringify(errorData).substring(0, 200)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    console.log('Yodlee init: Storing connection in database');

    // Store connection in database
    const { error: dbError } = await supabaseClient
      .from('yodlee_connections')
      .upsert({
        user_id: user.id,
        yodlee_user_id: yodleeUserId,
        access_token: userToken,
        status: 'active',
      }, {
        onConflict: 'user_id'
      });

    if (dbError) {
      console.error('Yodlee init: Database error', dbError);
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

    console.log('Yodlee init: Connection initialized successfully');

    // Return FastLink configuration with Bearer prefix
    const fastLinkUrl = `${baseUrl}/authenticate/restserver/fastlink?accessToken=Bearer ${userToken}&locale=en-GB`;

    return new Response(
      JSON.stringify({
        success: true,
        fastLinkUrl,
        accessToken: userToken,
        baseUrl,
        message: 'Yodlee connection initialized successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Yodlee init: Unexpected error', error);
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
