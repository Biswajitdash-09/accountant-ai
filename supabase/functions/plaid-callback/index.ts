import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'AUTH_ERROR',
          message: 'Authentication required',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { public_token, metadata } = await req.json();

    if (!public_token) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'MISSING_TOKEN',
          message: 'Public token is required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Exchanging Plaid public token for user: ${user.id}`);

    // Get Plaid credentials
    const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
    const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
    const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      console.error('Plaid credentials not configured');
      return new Response(
        JSON.stringify({
          success: false,
          code: 'CONFIG_ERROR',
          message: 'Plaid integration not configured',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const plaidUrl = PLAID_ENV === 'production'
      ? 'https://production.plaid.com'
      : PLAID_ENV === 'development'
      ? 'https://development.plaid.com'
      : 'https://sandbox.plaid.com';

    // Exchange public token for access token
    const exchangeResponse = await fetch(`${plaidUrl}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({
        public_token,
      }),
    });

    if (!exchangeResponse.ok) {
      const errorData = await exchangeResponse.json();
      console.error('Plaid exchange error:', errorData);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'EXCHANGE_ERROR',
          message: errorData.error_message || 'Failed to exchange token',
          details: errorData,
        }),
        {
          status: exchangeResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const exchangeData = await exchangeResponse.json();
    const { access_token, item_id } = exchangeData;

    console.log(`Plaid token exchanged successfully, item_id: ${item_id}`);

    // Get account information
    const accountsResponse = await fetch(`${plaidUrl}/accounts/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({
        access_token,
      }),
    });

    let accounts = [];
    let institutionName = metadata?.institution?.name || 'Unknown Bank';
    let institutionId = metadata?.institution?.institution_id || null;

    if (accountsResponse.ok) {
      const accountsData = await accountsResponse.json();
      accounts = accountsData.accounts;
      console.log(`Retrieved ${accounts.length} accounts from Plaid`);
    }

    // Store connection in database
    const { error: dbError } = await supabaseClient
      .from('plaid_connections')
      .upsert({
        user_id: user.id,
        access_token,
        item_id,
        institution_id: institutionId,
        institution_name: institutionName,
        accounts,
        status: 'active',
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,item_id',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'DB_ERROR',
          message: 'Failed to save connection',
          details: dbError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Plaid connection saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bank account connected successfully',
        institution: institutionName,
        accounts: accounts.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in plaid-callback:', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
