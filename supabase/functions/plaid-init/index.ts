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

    console.log(`Initializing Plaid for user: ${user.id}`);

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
          message: 'Plaid integration not configured. Please contact support.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine Plaid API URL based on environment
    const plaidUrl = PLAID_ENV === 'production'
      ? 'https://production.plaid.com'
      : PLAID_ENV === 'development'
      ? 'https://development.plaid.com'
      : 'https://sandbox.plaid.com';

    console.log(`Using Plaid environment: ${PLAID_ENV} (${plaidUrl})`);

    // Create Plaid Link token
    const linkTokenResponse = await fetch(`${plaidUrl}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET,
      },
      body: JSON.stringify({
        user: {
          client_user_id: user.id,
        },
        client_name: 'Accountant AI',
        products: ['transactions', 'auth'],
        country_codes: ['US'],
        language: 'en',
        webhook: `${Deno.env.get('SUPABASE_URL')}/functions/v1/plaid-webhook`,
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/plaid-callback`,
      }),
    });

    if (!linkTokenResponse.ok) {
      const errorData = await linkTokenResponse.json();
      console.error('Plaid API error:', errorData);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'PLAID_API_ERROR',
          message: errorData.error_message || 'Failed to initialize Plaid connection',
          details: errorData,
        }),
        {
          status: linkTokenResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const linkTokenData = await linkTokenResponse.json();
    console.log('Plaid Link token created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        linkToken: linkTokenData.link_token,
        expiration: linkTokenData.expiration,
        message: 'Plaid Link token created successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in plaid-init:', error);
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
