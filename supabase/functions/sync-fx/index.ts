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

    console.log('Starting FX sync...');

    // Popular currency pairs with INR base
    const currencyPairs = [
      { base: 'USD', quote: 'INR' },
      { base: 'EUR', quote: 'INR' },
      { base: 'GBP', quote: 'INR' },
      { base: 'JPY', quote: 'INR' },
      { base: 'CAD', quote: 'INR' },
      { base: 'AUD', quote: 'INR' },
      { base: 'CHF', quote: 'INR' },
      { base: 'CNY', quote: 'INR' },
      { base: 'SGD', quote: 'INR' },
      // Cross rates
      { base: 'USD', quote: 'EUR' },
      { base: 'USD', quote: 'GBP' },
      { base: 'EUR', quote: 'GBP' },
    ];

    const exchangeRates = [];

    // Fetch rates from Open Exchange Rates API (free tier)
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/USD`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rates = data.rates;
      
      console.log('Fetched exchange rates:', Object.keys(rates).length, 'currencies');

      // Calculate rates for our currency pairs
      for (const pair of currencyPairs) {
        let rate = 0;

        if (pair.base === 'USD') {
          rate = rates[pair.quote] || 0;
        } else if (pair.quote === 'USD') {
          rate = rates[pair.base] ? 1 / rates[pair.base] : 0;
        } else {
          // Cross rate calculation
          const baseToUSD = rates[pair.base] ? 1 / rates[pair.base] : 0;
          const usdToQuote = rates[pair.quote] || 0;
          rate = baseToUSD * usdToQuote;
        }

        if (rate > 0) {
          exchangeRates.push({
            base: pair.base,
            quote: pair.quote,
            rate: rate,
            fetched_at: new Date().toISOString()
          });
        }
      }

      console.log('Prepared', exchangeRates.length, 'exchange rate entries');

      // Insert rates into database
      const { error: insertError } = await supabase
        .from('exchange_rates')
        .insert(exchangeRates);

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }

      console.log('Successfully inserted exchange rates');

      // Clean up old rates (keep last 1000 entries)
      const { error: cleanupError } = await supabase
        .rpc('cleanup_old_exchange_rates', { keep_count: 1000 });

      if (cleanupError) {
        console.warn('Cleanup warning:', cleanupError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          rates_updated: exchangeRates.length,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (apiError) {
      console.error('API fetch error:', apiError);
      
      // Fallback: Insert some basic rates
      const fallbackRates = [
        { base: 'USD', quote: 'INR', rate: 83.25 },
        { base: 'EUR', quote: 'INR', rate: 90.50 },
        { base: 'GBP', quote: 'INR', rate: 105.75 },
      ];

      const fallbackEntries = fallbackRates.map(rate => ({
        ...rate,
        fetched_at: new Date().toISOString()
      }));

      await supabase
        .from('exchange_rates')
        .insert(fallbackEntries);

      return new Response(
        JSON.stringify({ 
          success: true, 
          rates_updated: fallbackEntries.length,
          note: 'Used fallback rates due to API error',
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Sync FX error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to sync exchange rates', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
