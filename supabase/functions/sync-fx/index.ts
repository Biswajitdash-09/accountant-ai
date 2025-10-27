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

    console.log('Starting FX rates sync...');

    const { data: currencies } = await supabaseAdmin
      .from('currencies')
      .select('id, code')
      .eq('is_active', true);

    const baseCurrency = currencies?.find(c => c.code === 'USD');
    if (!baseCurrency) throw new Error('USD base currency not found');

    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const fxData = await response.json();

    const rateRecords = currencies?.filter(c => c.code !== 'USD').map(currency => ({
      base_currency_id: baseCurrency.id,
      target_currency_id: currency.id,
      rate: fxData.rates[currency.code] || 1,
      rate_date: new Date().toISOString().split('T')[0],
      source: 'exchangerate-api'
    })) || [];

    if (rateRecords.length > 0) {
      await supabaseAdmin.from('exchange_rates').upsert(rateRecords, {
        onConflict: 'base_currency_id,target_currency_id,rate_date'
      });
    }

    return new Response(JSON.stringify({ success: true, synced: rateRecords.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
