import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting bank transaction sync job');

    let syncedCount = 0;
    let errorCount = 0;

    // Sync Plaid connections
    const { data: plaidConnections, error: plaidError } = await supabaseAdmin
      .from('plaid_connections')
      .select('*')
      .eq('status', 'active');

    if (plaidError) {
      console.error('Error fetching Plaid connections:', plaidError);
    } else if (plaidConnections && plaidConnections.length > 0) {
      console.log(`Found ${plaidConnections.length} active Plaid connections`);
      
      const PLAID_CLIENT_ID = Deno.env.get('PLAID_CLIENT_ID');
      const PLAID_SECRET = Deno.env.get('PLAID_SECRET');
      const PLAID_ENV = Deno.env.get('PLAID_ENV') || 'sandbox';
      
      const plaidUrl = PLAID_ENV === 'production'
        ? 'https://production.plaid.com'
        : PLAID_ENV === 'development'
        ? 'https://development.plaid.com'
        : 'https://sandbox.plaid.com';

      for (const connection of plaidConnections) {
        try {
          // Get transactions from last 30 days
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          const endDate = new Date().toISOString().split('T')[0];

          const transactionsResponse = await fetch(`${plaidUrl}/transactions/get`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'PLAID-CLIENT-ID': PLAID_CLIENT_ID!,
              'PLAID-SECRET': PLAID_SECRET!,
            },
            body: JSON.stringify({
              access_token: connection.access_token,
              start_date: startDate,
              end_date: endDate,
            }),
          });

          if (!transactionsResponse.ok) {
            console.error(`Error fetching Plaid transactions for connection ${connection.id}`);
            errorCount++;
            continue;
          }

          const transactionsData = await transactionsResponse.json();
          const transactions = transactionsData.transactions;

          console.log(`Found ${transactions.length} transactions for connection ${connection.id}`);

          // Process and store transactions
          for (const transaction of transactions) {
            const { error: insertError } = await supabaseAdmin
              .from('transactions')
              .upsert({
                user_id: connection.user_id,
                external_id: transaction.transaction_id,
                amount: Math.abs(transaction.amount),
                type: transaction.amount > 0 ? 'expense' : 'income',
                description: transaction.name,
                category: transaction.category?.[0] || 'Uncategorized',
                date: transaction.date,
                metadata: {
                  source: 'plaid',
                  merchant: transaction.merchant_name,
                  pending: transaction.pending,
                  account_id: transaction.account_id,
                },
              }, {
                onConflict: 'external_id',
                ignoreDuplicates: true,
              });

            if (!insertError) {
              syncedCount++;
            }
          }

          // Update last sync time
          await supabaseAdmin
            .from('plaid_connections')
            .update({ last_sync_at: new Date().toISOString() })
            .eq('id', connection.id);

        } catch (error) {
          console.error(`Error syncing Plaid connection ${connection.id}:`, error);
          errorCount++;
        }
      }
    }

    // Sync TrueLayer connections
    const { data: truelayerConnections, error: truelayerError } = await supabaseAdmin
      .from('truelayer_connections')
      .select('*')
      .eq('status', 'active');

    if (!truelayerError && truelayerConnections && truelayerConnections.length > 0) {
      console.log(`Found ${truelayerConnections.length} active TrueLayer connections`);
      
      // Similar sync logic for TrueLayer
      // Implementation depends on TrueLayer API structure
    }

    // Sync Mono connections
    const { data: monoConnections, error: monoError } = await supabaseAdmin
      .from('mono_connections')
      .select('*')
      .eq('status', 'active');

    if (!monoError && monoConnections && monoConnections.length > 0) {
      console.log(`Found ${monoConnections.length} active Mono connections`);
      
      // Similar sync logic for Mono
      // Implementation depends on Mono API structure
    }

    console.log(`Sync complete: ${syncedCount} transactions synced, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: syncedCount,
        errors: errorCount,
        message: 'Bank transaction sync completed',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in sync-bank-transactions:', error);
    return new Response(
      JSON.stringify({
        success: false,
        code: 'INTERNAL_ERROR',
        message: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
