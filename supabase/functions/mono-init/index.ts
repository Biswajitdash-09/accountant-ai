import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    console.log('Mono init: Starting initialization');
    
    const publicKey = Deno.env.get('MONO_PUBLIC_KEY');

    if (!publicKey) {
      console.error('Mono init: Public key not configured');
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'CONFIG_ERROR',
          message: 'Mono not configured',
          details: 'Missing public key'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Mono init: Missing authorization header');
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
      console.error('Mono init: User authentication failed', userError);
      return new Response(
        JSON.stringify({ 
          success: false,
          code: 'AUTH_ERROR',
          message: 'Unauthorized'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log(`Mono init: Initializing connection for user ${user.id}`);

    // Generate unique reference for this connection attempt
    const reference = `mono_${user.id}_${Date.now()}`;

    console.log('Mono init: Connection initialized successfully');

    return new Response(
      JSON.stringify({
        success: true,
        publicKey,
        reference,
        message: 'Mono connection initialized'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Mono init: Unexpected error', error);
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
