import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Check if Yodlee secrets are configured
  const clientId = Deno.env.get('YODLEE_CLIENT_ID');
  const secret = Deno.env.get('YODLEE_SECRET');
  const baseUrl = Deno.env.get('YODLEE_BASE_URL');

  if (!clientId || !secret || !baseUrl) {
    return new Response(JSON.stringify({ message: 'Yodlee not configured yet. Please add API keys in Edge Function Secrets.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }

  // Placeholder response until keys are added
  return new Response(JSON.stringify({ message: 'Yodlee configured. Implement FastLink token exchange after adding keys.' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
