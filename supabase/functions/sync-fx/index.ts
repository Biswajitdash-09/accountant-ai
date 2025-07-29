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

    // Enhanced currency pairs with NGN and ZAR prioritized
    const currencyPairs = [
      // Priority pairs with NGN and ZAR
      { base: 'USD', quote: 'NGN' },
      { base: 'USD', quote: 'ZAR' },
      { base: 'EUR', quote: 'NGN' },
      { base: 'EUR', quote: 'ZAR' },
      { base: 'GBP', quote: 'NGN' },
      { base: 'GBP', quote: 'ZAR' },
      { base: 'NGN', quote: 'USD' },
      { base: 'ZAR', quote: 'USD' },
      { base: 'NGN', quote: 'ZAR' },
      { base: 'ZAR', quote: 'NGN' },
      
      // Existing popular pairs
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
      { base: 'USD', quote: 'CAD' },
      { base: 'USD', quote: 'AUD' },
      { base: 'USD', quote: 'JPY' },
    ];

    const exchangeRates = [];

    // Fetch rates from Exchange Rate API
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

      // Update currencies table with latest rates
      for (const exchangeRate of exchangeRates) {
        if (exchangeRate.base === 'USD') {
          await supabase
            .from('currencies')
            .update({ 
              exchange_rate: exchangeRate.rate,
              updated_at: new Date().toISOString()
            })
            .eq('code', exchangeRate.quote);
        }
      }

      // Clean up old rates (keep last 2000 entries for better historical data)
      const { error: cleanupError } = await supabase
        .rpc('cleanup_old_exchange_rates', { keep_count: 2000 });

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
      
      // Enhanced fallback rates including NGN and ZAR with more realistic values
      const fallbackRates = [
        { base: 'USD', quote: 'NGN', rate: 1650.00 },
        { base: 'USD', quote: 'ZAR', rate: 18.50 },
        { base: 'USD', quote: 'INR', rate: 83.25 },
        { base: 'USD', quote: 'EUR', rate: 0.85 },
        { base: 'USD', quote: 'GBP', rate: 0.73 },
        { base: 'EUR', quote: 'NGN', rate: 1941.18 },
        { base: 'EUR', quote: 'ZAR', rate: 21.76 },
        { base: 'EUR', quote: 'INR', rate: 97.94 },
        { base: 'GBP', quote: 'NGN', rate: 2260.27 },
        { base: 'GBP', quote: 'ZAR', rate: 25.34 },
        { base: 'GBP', quote: 'INR', rate: 114.04 },
        { base: 'NGN', quote: 'USD', rate: 0.000606 },
        { base: 'ZAR', quote: 'USD', rate: 0.054054 },
        { base: 'NGN', quote: 'ZAR', rate: 0.0112 },
        { base: 'ZAR', quote: 'NGN', rate: 89.19 },
      ];

      const fallbackEntries = fallbackRates.map(rate => ({
        ...rate,
        fetched_at: new Date().toISOString()
      }));

      await supabase
        .from('exchange_rates')
        .insert(fallbackEntries);

      // Update currencies table with fallback rates
      for (const rate of fallbackRates) {
        if (rate.base === 'USD') {
          await supabase
            .from('currencies')
            .update({ 
              exchange_rate: rate.rate,
              updated_at: new Date().toISOString()
            })
            .eq('code', rate.quote);
        }
      }

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
