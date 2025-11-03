import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { walletAddress, walletType, blockchain } = await req.json();

    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }

    // Check if wallet already exists
    const { data: existingWallet } = await supabaseAdmin
      .from('crypto_wallets')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (existingWallet) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Wallet already connected',
          wallet: existingWallet
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new wallet
    const { data: wallet, error } = await supabaseAdmin
      .from('crypto_wallets')
      .insert({
        user_id: user.id,
        wallet_address: walletAddress.toLowerCase(),
        wallet_type: walletType || 'metamask',
        blockchain: blockchain || 'ethereum',
        is_primary: false,
        connected_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, wallet }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
