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

    const cryptoIds = 'bitcoin,ethereum,tether,binancecoin,ripple,cardano,solana,polkadot,dogecoin,matic-network';
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&order=market_cap_desc`;
    
    const response = await fetch(url);
    const cryptoData = await response.json();

    const priceRecords = cryptoData.map((coin: any) => ({
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price_usd: coin.current_price,
      price_change_24h: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap || 0,
      volume_24h: coin.total_volume || 0,
      last_updated: new Date().toISOString()
    }));

    await supabaseAdmin.from('crypto_prices').insert(priceRecords);

    return new Response(JSON.stringify({ success: true, synced: priceRecords.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
