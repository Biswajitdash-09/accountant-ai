import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get active token
    const { data: tokenData, error: tokenError } = await supabase
      .from('hmrc_tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('No active HMRC connection found');
    }

    // Check if token needs refresh
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log('Token expired, needs refresh');
      throw new Error('Token expired, please reconnect');
    }

    console.log('Fetching data from HMRC...');

    // Fetch Self Assessment data
    const saResponse = await fetch(
      'https://test-api.service.hmrc.gov.uk/individuals/self-assessment/account',
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Accept': 'application/vnd.hmrc.1.0+json'
        }
      }
    );

    let saData = null;
    if (saResponse.ok) {
      saData = await saResponse.json();
      console.log('Self Assessment data fetched successfully');
    }

    // Store sync record
    const { error: syncError } = await supabase
      .from('hmrc_data_sync')
      .insert({
        user_id: user.id,
        connection_id: tokenData.connection_id,
        data_type: 'self_assessment',
        sync_status: saData ? 'completed' : 'failed',
        records_synced: saData ? 1 : 0,
        last_sync_at: new Date().toISOString()
      });

    if (syncError) {
      console.error('Error storing sync record:', syncError);
    }

    // Store tax data if available
    if (saData) {
      const { error: dataError } = await supabase
        .from('hmrc_tax_data')
        .insert({
          user_id: user.id,
          connection_id: tokenData.connection_id,
          data_type: 'self_assessment',
          tax_year: new Date().getFullYear().toString(),
          data: saData
        });

      if (dataError) {
        console.error('Error storing tax data:', dataError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        synced: {
          selfAssessment: !!saData
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in hmrc-sync-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
