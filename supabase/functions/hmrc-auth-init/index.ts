import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HMRC_CLIENT_ID = Deno.env.get('HMRC_CLIENT_ID');
    const HMRC_REDIRECT_URI = Deno.env.get('HMRC_REDIRECT_URI');
    
    if (!HMRC_CLIENT_ID || !HMRC_REDIRECT_URI) {
      throw new Error('HMRC credentials not configured');
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // HMRC OAuth scopes
    const scopes = [
      'read:self-assessment',
      'read:vat',
      'read:obligations'
    ].join(' ');

    const authUrl = new URL('https://test-api.service.hmrc.gov.uk/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', HMRC_CLIENT_ID);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('redirect_uri', HMRC_REDIRECT_URI);
    authUrl.searchParams.set('state', state);

    console.log('Generated HMRC auth URL:', authUrl.toString());

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        state 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in hmrc-auth-init:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
