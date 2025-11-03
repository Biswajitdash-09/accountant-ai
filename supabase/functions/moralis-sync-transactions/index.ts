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

    // Fetch transactions from Moralis
    const chain = wallet.blockchain === 'ethereum' ? 'eth' : wallet.blockchain;
    const transactionsUrl = `https://deep-index.moralis.io/api/v2/${wallet.wallet_address}?chain=${chain}&limit=50`;
    
    const response = await fetch(transactionsUrl, {
      headers: {
        'X-API-Key': moralisApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.statusText}`);
    }

    const data = await response.json();
    const transactions = data.result || [];

    let syncedCount = 0;

    for (const tx of transactions) {
      try {
        const transactionType = tx.from_address?.toLowerCase() === wallet.wallet_address.toLowerCase() 
          ? 'send' 
          : 'receive';

        // Check if transaction already exists
        const { data: existing } = await supabaseAdmin
          .from('crypto_transactions')
          .select('id')
          .eq('transaction_hash', tx.hash)
          .single();

        if (!existing) {
          await supabaseAdmin.from('crypto_transactions').insert({
            wallet_id: walletId,
            transaction_hash: tx.hash,
            from_address: tx.from_address || '',
            to_address: tx.to_address || '',
            value: parseFloat(tx.value) / Math.pow(10, 18),
            token_symbol: 'ETH',
            transaction_type: transactionType,
            timestamp: new Date(tx.block_timestamp).toISOString(),
            gas_fee: parseFloat(tx.gas_price || 0) * parseFloat(tx.receipt_gas_used || 0) / Math.pow(10, 18),
            status: tx.receipt_status === '1' ? 'confirmed' : 'failed',
          });
          syncedCount++;
        }
      } catch (error) {
        console.error('Error processing transaction:', tx.hash, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: syncedCount,
        total: transactions.length,
        message: `Synced ${syncedCount} new transactions`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
