import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a random backup code
function generateBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars like 0, O, I, 1
  let code = '';
  const randomValues = new Uint8Array(8);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 8; i++) {
    code += chars[randomValues[i] % chars.length];
  }
  return code;
}

// Hash a backup code for storage
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating backup codes for user:', user.id);

    // Check if 2FA is enabled
    const { data: settings, error: fetchError } = await supabase
      .from('user_security_settings')
      .select('two_factor_enabled, two_factor_verified')
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Security settings not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!settings?.two_factor_enabled || !settings?.two_factor_verified) {
      return new Response(
        JSON.stringify({ error: '2FA must be enabled and verified first' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 8 backup codes
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];
    
    for (let i = 0; i < 8; i++) {
      const code = generateBackupCode();
      plainCodes.push(code);
      hashedCodes.push(await hashCode(code));
    }

    // Store hashed codes
    const { error: updateError } = await supabase
      .from('user_security_settings')
      .update({
        backup_codes: hashedCodes,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save backup codes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Backup codes generated successfully for user:', user.id);

    // Return plain codes (one-time view only!)
    return new Response(
      JSON.stringify({ 
        codes: plainCodes,
        message: 'Save these codes in a secure location. They can only be viewed once.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating backup codes:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
