
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { symbols } = await req.json().catch(() => ({}));

    console.log('Starting crypto sync...', symbols ? `for symbols: ${symbols.join(', ')}` : 'for all popular cryptos');

    // Default popular cryptocurrencies to track
    const defaultSymbols = ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'polkadot', 'matic-network', 'solana', 'chainlink'];
    const cryptoIds = symbols && symbols.length > 0 
      ? symbols.map((symbol: string) => mapSymbolToId(symbol)).filter(Boolean)
      : defaultSymbols;

    if (cryptoIds.length === 0) {
      throw new Error('No valid crypto symbols provided');
    }

    // Fetch prices from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(',')}&vs_currencies=inr`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const priceData = await response.json();
    console.log('Fetched crypto prices:', Object.keys(priceData).length, 'cryptos');

    const cryptoPrices = [];

    for (const [cryptoId, prices] of Object.entries(priceData)) {
      const symbol = mapIdToSymbol(cryptoId);
      const price = (prices as any).inr;

      if (symbol && price) {
        cryptoPrices.push({
          symbol: symbol,
          price: price,
          fetched_at: new Date().toISOString()
        });
      }
    }

    console.log('Prepared', cryptoPrices.length, 'crypto price entries');

    // Insert prices into database
    const { error: insertError } = await supabase
      .from('crypto_prices')
      .insert(cryptoPrices);

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Successfully inserted crypto prices');

    // Clean up old prices (keep last 1000 entries per symbol)
    const { error: cleanupError } = await supabase
      .rpc('cleanup_old_crypto_prices', { keep_count: 1000 });

    if (cleanupError) {
      console.warn('Cleanup warning:', cleanupError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        prices_updated: cryptoPrices.length,
        symbols: cryptoPrices.map(p => p.symbol),
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync crypto error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to sync crypto prices', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to map symbols to CoinGecko IDs
function mapSymbolToId(symbol: string): string | null {
  const symbolMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum', 
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'MATIC': 'matic-network',
    'SOL': 'solana',
    'LINK': 'chainlink',
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'AVAX': 'avalanche-2',
    'UNI': 'uniswap'
  };
  
  return symbolMap[symbol.toUpperCase()] || null;
}

// Helper function to map CoinGecko IDs back to symbols
function mapIdToSymbol(id: string): string | null {
  const idMap: Record<string, string> = {
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'binancecoin': 'BNB', 
    'cardano': 'ADA',
    'polkadot': 'DOT',
    'matic-network': 'MATIC',
    'solana': 'SOL',
    'chainlink': 'LINK',
    'litecoin': 'LTC',
    'bitcoin-cash': 'BCH',
    'ripple': 'XRP',
    'dogecoin': 'DOGE',
    'avalanche-2': 'AVAX',
    'uniswap': 'UNI'
  };
  
  return idMap[id] || null;
}
