import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('Mono callback: Processing callback');
    
    const { code } = await req.json();

    if (!code) {
      console.error('Mono callback: Missing code');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'INVALID_REQUEST',
          message: 'Missing Mono code'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const secretKey = Deno.env.get('MONO_SECRET_KEY');
    if (!secretKey) {
      console.error('Mono callback: Secret key not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'CONFIG_ERROR',
          message: 'Mono not configured',
          details: 'Missing secret key'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Mono callback: Missing authorization header');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
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
      console.error('Mono callback: User authentication failed', userError);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Mono callback: Processing for user ${user.id}`);

    // Exchange code for account ID
    console.log('Mono callback: Exchanging code for account ID');
    const accountResponse = await fetch('https://api.withmono.com/account/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'mono-sec-key': secretKey,
      },
      body: JSON.stringify({ code }),
    });

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.error('Mono callback: Account exchange failed', errorText.substring(0, 200));
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'EXCHANGE_FAILED',
          message: 'Failed to exchange code for account',
          details: errorText.substring(0, 200)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const accountData = await accountResponse.json();
    console.log('Mono callback: Account ID obtained');

    // Get account details
    console.log('Mono callback: Fetching account details');
    const detailsResponse = await fetch(`https://api.withmono.com/accounts/${accountData.id}`, {
      headers: {
        'mono-sec-key': secretKey,
      },
    });

    let accountDetails: any = {};
    if (detailsResponse.ok) {
      accountDetails = await detailsResponse.json();
      console.log('Mono callback: Account details retrieved');
    } else {
      console.warn('Mono callback: Failed to fetch account details');
    }

    console.log('Mono callback: Storing connection in database');

    // Store connection in database
    const { error: dbError } = await supabaseClient
      .from('mono_connections')
      .insert({
        user_id: user.id,
        account_id: accountData.id,
        mono_code: code,
        institution_name: accountDetails.institution?.name || 'Unknown',
        institution_type: accountDetails.institution?.type,
        account_name: accountDetails.account?.name,
        status: 'active',
      });

    if (dbError) {
      console.error('Mono callback: Database error', dbError);
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

    console.log('Mono callback: Connection established successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mono connection established successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Mono callback: Unexpected error', error);
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
