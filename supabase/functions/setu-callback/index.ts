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
    const { consentId, accountId } = await req.json();

    if (!consentId || !accountId) {
      return new Response(
        JSON.stringify({
          success: false,
          code: 'MISSING_PARAMS',
          message: 'Consent ID and Account ID are required',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing Setu callback for user: ${user.id}, consent: ${consentId}`);

    // Get Setu credentials
    const SETU_CLIENT_ID = Deno.env.get('SETU_CLIENT_ID');
    const SETU_CLIENT_SECRET = Deno.env.get('SETU_CLIENT_SECRET');
    const SETU_BASE_URL = Deno.env.get('SETU_BASE_URL') || 'https://fiu-uat.setu.co';

    if (!SETU_CLIENT_ID || !SETU_CLIENT_SECRET) {
      console.error('Setu credentials not configured');
      return new Response(
        JSON.stringify({
          success: false,
          code: 'CONFIG_ERROR',
          message: 'Setu integration not configured',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get OAuth token
    const tokenResponse = await fetch(`${SETU_BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SETU_CLIENT_ID,
        client_secret: SETU_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Setu token error:', errorData);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'TOKEN_ERROR',
          message: 'Failed to authenticate with Setu',
        }),
        {
          status: tokenResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Verify consent status
    const consentStatusResponse = await fetch(`${SETU_BASE_URL}/consents/${consentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-client-id': SETU_CLIENT_ID,
      },
    });

    if (!consentStatusResponse.ok) {
      const errorData = await consentStatusResponse.json();
      console.error('Setu consent status error:', errorData);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'CONSENT_STATUS_ERROR',
          message: 'Failed to verify consent status',
        }),
        {
          status: consentStatusResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const consentStatus = await consentStatusResponse.json();
    
    // Get account details
    const accountResponse = await fetch(`${SETU_BASE_URL}/accounts/${accountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-client-id': SETU_CLIENT_ID,
      },
    });

    let accountDetails = {};
    let fipName = 'Unknown FIP';
    let fipId = null;

    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      accountDetails = accountData;
      fipName = accountData.fipName || 'Unknown FIP';
      fipId = accountData.fipId;
      console.log(`Retrieved account details from FIP: ${fipName}`);
    }

    // Store connection in database
    const { error: dbError } = await supabaseClient
      .from('setu_connections')
      .upsert({
        user_id: user.id,
        account_id: accountId,
        fip_id: fipId,
        fip_name: fipName,
        account_type: accountDetails.type || 'SAVINGS',
        account_details: accountDetails,
        consent_id: consentId,
        consent_status: consentStatus.status || 'active',
        last_sync_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,account_id',
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

    console.log('Setu connection saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bank account connected successfully via Setu',
        fip: fipName,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in setu-callback:', error);
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
