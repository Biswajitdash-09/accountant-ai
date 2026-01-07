import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base32 decode for TOTP verification
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

// Verify TOTP with time window tolerance
async function verifyTOTP(code: string, secret: string): Promise<boolean> {
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

// Simple hash for backup code comparison
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

    const { code } = await req.json();
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code required to disable 2FA' }),
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

    console.log('Disabling 2FA for user:', user.id);

    // Get the stored secret and backup codes
    const { data: settings, error: fetchError } = await supabase
      .from('user_security_settings')
      .select('two_factor_secret, backup_codes')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !settings) {
      return new Response(
        JSON.stringify({ error: '2FA settings not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let isValid = false;

    // Try TOTP code first (if it's 6 digits)
    if (code.length === 6 && /^\d+$/.test(code) && settings.two_factor_secret) {
      isValid = await verifyTOTP(code, settings.two_factor_secret);
    }

    // Try backup code (8 characters)
    if (!isValid && settings.backup_codes) {
      const hashedCode = await hashCode(code.toUpperCase());
      const backupCodes = settings.backup_codes as string[];
      if (backupCodes.includes(hashedCode)) {
        isValid = true;
        // Remove used backup code
        const updatedCodes = backupCodes.filter(c => c !== hashedCode);
        await supabase
          .from('user_security_settings')
          .update({ backup_codes: updatedCodes })
          .eq('user_id', user.id);
      }
    }

    if (!isValid) {
      console.log('Invalid code for disabling 2FA, user:', user.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Disable 2FA
    const { error: updateError } = await supabase
      .from('user_security_settings')
      .update({
        two_factor_enabled: false,
        two_factor_verified: false,
        two_factor_secret: null,
        backup_codes: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to disable 2FA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('2FA disabled successfully for user:', user.id);

    return new Response(
      JSON.stringify({ success: true, message: '2FA disabled successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
