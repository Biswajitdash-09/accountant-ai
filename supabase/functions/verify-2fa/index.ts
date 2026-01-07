import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base32 decode for TOTP
function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const char of str.toUpperCase()) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return bytes;
}

// Generate TOTP code
async function generateTOTP(secret: string, timeStep: number = 30): Promise<string> {
  const key = base32Decode(secret);
  const time = Math.floor(Date.now() / 1000 / timeStep);
  
  const timeBuffer = new ArrayBuffer(8);
  const timeView = new DataView(timeBuffer);
  timeView.setUint32(4, time, false);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
  const signatureArray = new Uint8Array(signature);
  
  const offset = signatureArray[signatureArray.length - 1] & 0x0f;
  const code = (
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff)
  ) % 1000000;
  
  return code.toString().padStart(6, '0');
}

// Verify TOTP with time window tolerance
async function verifyTOTP(code: string, secret: string): Promise<boolean> {
  // Check current and adjacent time windows for clock skew tolerance
  for (const offset of [0, -1, 1]) {
    const time = Math.floor(Date.now() / 1000 / 30) + offset;
    
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(4, time, false);
    
    const key = base32Decode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
    const signatureArray = new Uint8Array(signature);
    
    const off = signatureArray[signatureArray.length - 1] & 0x0f;
    const expectedCode = (
      ((signatureArray[off] & 0x7f) << 24) |
      ((signatureArray[off + 1] & 0xff) << 16) |
      ((signatureArray[off + 2] & 0xff) << 8) |
      (signatureArray[off + 3] & 0xff)
    ) % 1000000;
    
    if (code === expectedCode.toString().padStart(6, '0')) {
      return true;
    }
  }
  return false;
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

    const { code } = await req.json();
    if (!code || code.length !== 6) {
      return new Response(
        JSON.stringify({ error: 'Invalid code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    console.log('Verifying 2FA code for user:', user.id);

    // Get the stored secret
    const { data: settings, error: fetchError } = await supabase
      .from('user_security_settings')
      .select('two_factor_secret')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !settings?.two_factor_secret) {
      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: '2FA not set up' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the code
    const isValid = await verifyTOTP(code, settings.two_factor_secret);
    
    if (!isValid) {
      console.log('Invalid 2FA code for user:', user.id);
      return new Response(
        JSON.stringify({ verified: false, error: 'Invalid verification code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('user_security_settings')
      .update({
        two_factor_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify 2FA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('2FA verified successfully for user:', user.id);

    return new Response(
      JSON.stringify({ verified: true, message: '2FA verified successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
