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

    // Fetch NFTs from Moralis
    const chain = wallet.blockchain === 'ethereum' ? 'eth' : wallet.blockchain;
    const nftsUrl = `https://deep-index.moralis.io/api/v2/${wallet.wallet_address}/nft?chain=${chain}&format=decimal&limit=100`;
    
    const response = await fetch(nftsUrl, {
      headers: {
        'X-API-Key': moralisApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.statusText}`);
    }

    const data = await response.json();
    const nfts = data.result || [];

    // Delete old NFTs for this wallet
    await supabaseAdmin
      .from('crypto_nfts')
      .delete()
      .eq('wallet_id', walletId);

    let syncedCount = 0;

    for (const nft of nfts) {
      try {
        let metadata = {};
        let imageUrl = null;
        
        if (nft.metadata) {
          try {
            metadata = typeof nft.metadata === 'string' ? JSON.parse(nft.metadata) : nft.metadata;
            imageUrl = metadata.image || metadata.image_url || null;
          } catch (e) {
            console.log('Could not parse NFT metadata');
          }
        }

        await supabaseAdmin.from('crypto_nfts').insert({
          wallet_id: walletId,
          token_address: nft.token_address,
          token_id: nft.token_id,
          name: nft.name || metadata.name || 'Unknown NFT',
          collection: nft.name || 'Unknown Collection',
          metadata: metadata,
          image_url: imageUrl,
          floor_price_usd: null,
          acquired_at: new Date().toISOString(),
        });
        syncedCount++;
      } catch (error) {
        console.error('Error processing NFT:', nft.token_id, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncedCount,
        total: nfts.length,
        message: `Synced ${syncedCount} NFTs`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing NFTs:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
