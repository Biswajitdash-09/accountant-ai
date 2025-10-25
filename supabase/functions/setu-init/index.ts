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

    console.log(`Initializing Setu Account Aggregator for user: ${user.id}`);

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
          message: 'Setu integration not configured. Please contact support.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get OAuth token from Setu
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
          details: errorData,
        }),
        {
          status: tokenResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('Setu OAuth token obtained successfully');

    // Create consent request
    const consentResponse = await fetch(`${SETU_BASE_URL}/consents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'x-client-id': SETU_CLIENT_ID,
      },
      body: JSON.stringify({
        Detail: {
          consentStart: new Date().toISOString(),
          consentExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          Customer: {
            id: user.id,
          },
          FIDataRange: {
            from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
            to: new Date().toISOString(),
          },
          consentMode: 'STORE',
          consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
          fetchType: 'PERIODIC',
          Frequency: {
            unit: 'DAY',
            value: 1,
          },
          DataFilter: [
            {
              type: 'TRANSACTIONAMOUNT',
              operator: 'GREATER',
              value: '0',
            },
          ],
          DataLife: {
            unit: 'YEAR',
            value: 1,
          },
          DataConsumer: {
            id: SETU_CLIENT_ID,
          },
          Purpose: {
            code: '101',
            refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
            text: 'Wealth management service',
            Category: {
              type: 'Personal Finance',
            },
          },
        },
      }),
    });

    if (!consentResponse.ok) {
      const errorData = await consentResponse.json();
      console.error('Setu consent error:', errorData);
      return new Response(
        JSON.stringify({
          success: false,
          code: 'CONSENT_ERROR',
          message: 'Failed to create consent request',
          details: errorData,
        }),
        {
          status: consentResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const consentData = await consentResponse.json();
    const consentId = consentData.id;
    const consentUrl = consentData.url;

    console.log(`Setu consent created: ${consentId}`);

    return new Response(
      JSON.stringify({
        success: true,
        consentId,
        consentUrl,
        message: 'Setu consent request created successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in setu-init:', error);
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
