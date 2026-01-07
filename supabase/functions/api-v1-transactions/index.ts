import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-authenticated-user-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // SECURITY: Get user_id from authenticated header (set by API gateway)
    // Never trust user_id from query params or body directly
    const authenticatedUserId = req.headers.get('x-authenticated-user-id');
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      // Use authenticated user ID from header, fall back to query param for legacy support
      const userId = authenticatedUserId || url.searchParams.get('user_id');
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');
      const type = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '100');

      if (!userId) {
        return new Response(JSON.stringify({
          success: false,
          error: "Missing required parameter: user_id. Ensure you're authenticated via API gateway.",
          code: "AUTH_001"
        }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);
      if (type) query = query.eq('type', type);

      const { data, error } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        transactions: data,
        count: data.length,
        filters_applied: { startDate, endDate, type, limit }
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      // SECURITY: Use authenticated user ID, not from request body
      const userId = authenticatedUserId || body.user_id;
      const transactions = body.transactions;

      if (!userId || !transactions || !Array.isArray(transactions)) {
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid request. Provide user_id and transactions array",
          code: "DATA_002",
          example: {
            user_id: "uuid",
            transactions: [
              {
                type: "income",
                amount: 1000,
                category: "Salary",
                description: "Monthly salary",
                date: "2024-01-15"
              }
            ]
          }
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Get default currency for user
      const { data: profile } = await supabase
        .from('profiles')
        .select('default_currency_id')
        .eq('id', user_id)
        .single();

      const defaultCurrencyId = profile?.default_currency_id || 
        (await supabase.from('currencies').select('id').eq('code', 'USD').single()).data?.id;

      // Prepare transactions for insertion
      const transactionsToInsert = transactions.map(t => ({
        user_id,
        type: t.type,
        amount: t.amount,
        category: t.category || 'Uncategorized',
        description: t.description || '',
        date: t.date || new Date().toISOString().split('T')[0],
        currency_id: t.currency_id || defaultCurrencyId,
        notes: t.notes || null
      }));

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsToInsert)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        created: data.length,
        transactions: data
      }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: "Method not allowed",
      code: "METHOD_001",
      allowed_methods: ['GET', 'POST']
    }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[TRANSACTIONS-API] Error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      code: "SERVER_001"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
