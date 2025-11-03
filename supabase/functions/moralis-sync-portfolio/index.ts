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

    const { walletId } = await req.json();
    const moralisApiKey = Deno.env.get('MORALIS_API_KEY');

    if (!moralisApiKey) {
      throw new Error('Moralis API key not configured');
    }

    // Get wallet details
    const { data: wallet } = await supabaseAdmin
      .from('crypto_wallets')
      .select('*')
      .eq('id', walletId)
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Fetch token balances from Moralis
    const chain = wallet.blockchain === 'ethereum' ? 'eth' : wallet.blockchain;
    const balancesUrl = `https://deep-index.moralis.io/api/v2/${wallet.wallet_address}/erc20?chain=${chain}`;
    
    const balancesResponse = await fetch(balancesUrl, {
      headers: {
        'X-API-Key': moralisApiKey,
      },
    });

    if (!balancesResponse.ok) {
      throw new Error(`Moralis API error: ${balancesResponse.statusText}`);
    }

    const tokens = await balancesResponse.json();

    // Fetch native balance (ETH, BNB, etc.)
    const nativeBalanceUrl = `https://deep-index.moralis.io/api/v2/${wallet.wallet_address}/balance?chain=${chain}`;
    const nativeResponse = await fetch(nativeBalanceUrl, {
      headers: {
        'X-API-Key': moralisApiKey,
      },
    });

    const nativeData = await nativeResponse.json();

    // Delete old holdings for this wallet
    await supabaseAdmin
      .from('crypto_holdings')
      .delete()
      .eq('wallet_id', walletId);

    // Insert native token
    if (nativeData.balance && parseFloat(nativeData.balance) > 0) {
      const nativeSymbol = wallet.blockchain === 'ethereum' ? 'ETH' : 
                          wallet.blockchain === 'polygon' ? 'MATIC' :
                          wallet.blockchain === 'bsc' ? 'BNB' : 'NATIVE';
      
      const balance = parseFloat(nativeData.balance) / Math.pow(10, 18);
      
      await supabaseAdmin.from('crypto_holdings').insert({
        wallet_id: walletId,
        token_symbol: nativeSymbol,
        token_name: nativeSymbol,
        token_address: null,
        balance: balance,
        value_usd: 0,
        last_price_usd: 0,
      });
    }

    // Insert ERC20 tokens
    const holdingsToInsert = tokens.map((token: any) => ({
      wallet_id: walletId,
      token_symbol: token.symbol || 'UNKNOWN',
      token_name: token.name || 'Unknown Token',
      token_address: token.token_address,
      balance: parseFloat(token.balance) / Math.pow(10, parseInt(token.decimals || 18)),
      value_usd: 0,
      last_price_usd: 0,
    }));

    if (holdingsToInsert.length > 0) {
      await supabaseAdmin.from('crypto_holdings').insert(holdingsToInsert);
    }

    // Update wallet sync timestamp
    await supabaseAdmin
      .from('crypto_wallets')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', walletId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: holdingsToInsert.length + 1,
        message: `Synced ${holdingsToInsert.length + 1} tokens`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing portfolio:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
