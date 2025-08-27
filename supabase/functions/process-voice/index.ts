import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT and get user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for database operations
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { entry_id } = await req.json();
    
    if (!entry_id) {
      return new Response(
        JSON.stringify({ error: 'entry_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the voice entry and verify ownership
    const { data: entry, error: fetchError } = await serviceSupabase
      .from('voice_entries')
      .select('user_id, storage_path')
      .eq('id', entry_id)
      .single();

    if (fetchError || !entry) {
      console.error('Error fetching voice entry:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Voice entry not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (entry.user_id !== user.id) {
      console.log(`Access denied: user ${user.id} tried to access voice entry ${entry_id} owned by ${entry.user_id}`);
      return new Response(
        JSON.stringify({ error: 'Access denied: Voice entry not owned by user' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to processing
    await serviceSupabase
      .from('voice_entries')
      .update({ status: 'processing' })
      .eq('id', entry_id);

    try {
      // Get signed URL for the audio file
      const { data: signedUrlData } = await serviceSupabase.storage
        .from('voice')
        .createSignedUrl(entry.storage_path, 3600);

      if (!signedUrlData?.signedUrl) {
        throw new Error('Could not create signed URL for audio file');
      }

      // Download the audio file
      const audioResponse = await fetch(signedUrlData.signedUrl);
      const audioBuffer = await audioResponse.arrayBuffer();

      // Enhanced STT simulation with better transcripts
      const transcript = await enhancedWhisperAPI(audioBuffer);
      
      // Enhanced AI parsing with confidence scoring
      const parsed = await enhancedTransactionParsing(transcript);

      // Update voice entry with results
      await serviceSupabase
        .from('voice_entries')
        .update({
          status: 'done',
          transcript,
          parsed,
          processed_at: new Date().toISOString()
        })
        .eq('id', entry_id);

      // Create transaction if parsing was successful and confidence is high
      if (parsed && parsed.amount && parsed.confidence >= 0.7) {
        const { error: txnError } = await serviceSupabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: parsed.amount,
            currency: parsed.currency || 'INR',
            category: parsed.category || 'Other',
            description: parsed.description || transcript,
            date: parsed.date || new Date().toISOString().split('T')[0],
            type: parsed.type || 'expense',
          });

        if (txnError) {
          console.error('Error creating transaction:', txnError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Voice processing completed',
          entry_id,
          confidence: parsed?.confidence || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Processing error:', error);
      
      await serviceSupabase
        .from('voice_entries')
        .update({
          status: 'failed',
          error_message: error.message,
          processed_at: new Date().toISOString()
        })
        .eq('id', entry_id);

      return new Response(
        JSON.stringify({ error: 'Processing failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enhanced Whisper API simulation with better quality transcripts
async function enhancedWhisperAPI(audioBuffer: ArrayBuffer): Promise<string> {
  // Simulate more realistic and varied transcripts
  const enhancedTranscripts = [
    "I paid 2,450 rupees for dinner at Taj Hotel last night including tip and taxes",
    "Spent 850 rupees on groceries at More Megastore this morning for weekly shopping",
    "Uber ride to airport cost 1,200 rupees including toll and waiting charges",
    "Coffee and snacks at Cafe Coffee Day came to 320 rupees for two people",
    "Electricity bill payment of 3,200 rupees done online through PayTM",
    "Medical consultation fee of 800 rupees at Apollo Clinic for checkup",
    "Petrol refill for 2,100 rupees at HP petrol pump on highway",
    "Online shopping on Amazon for 4,500 rupees for electronic accessories",
    "Restaurant bill at Barbeque Nation was 1,800 rupees for family dinner",
    "Auto rickshaw fare of 150 rupees from metro station to office"
  ];
  
  return enhancedTranscripts[Math.floor(Math.random() * enhancedTranscripts.length)];
}

// Enhanced AI parsing with confidence scoring and better extraction
async function enhancedTransactionParsing(transcript: string) {
  // Enhanced parsing with confidence scoring
  const amountMatch = transcript.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*rupees?/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;

  // Enhanced category detection with more patterns
  let category = 'Other';
  let confidence = 0.5;
  
  const categoryPatterns = {
    'Food': {
      patterns: [/hotel|restaurant|cafe|dinner|lunch|breakfast|food|snacks|barbeque|dining/i],
      confidence: 0.9
    },
    'Transport': {
      patterns: [/taxi|uber|ola|auto|rickshaw|bus|train|metro|petrol|fuel|toll|airport/i],
      confidence: 0.9
    },
    'Shopping': {
      patterns: [/shopping|amazon|flipkart|store|mall|grocery|megastore|accessories|electronic/i],
      confidence: 0.85
    },
    'Bills': {
      patterns: [/bill|electricity|water|gas|phone|internet|payment|paytm/i],
      confidence: 0.9
    },
    'Healthcare': {
      patterns: [/medical|doctor|clinic|hospital|consultation|checkup|apollo/i],
      confidence: 0.9
    }
  };

  for (const [cat, config] of Object.entries(categoryPatterns)) {
    if (config.patterns.some(pattern => pattern.test(transcript))) {
      category = cat;
      confidence = Math.max(confidence, config.confidence);
      break;
    }
  }

  // Enhanced date detection
  let date = new Date().toISOString().split('T')[0];
  if (/yesterday/i.test(transcript)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split('T')[0];
  } else if (/last night/i.test(transcript)) {
    date = new Date().toISOString().split('T')[0]; // Assume same day for "last night"
  }

  // Determine transaction type
  const type = /received|income|salary|payment received/i.test(transcript) ? 'income' : 'expense';

  // Calculate overall confidence based on multiple factors
  const hasAmount = amount !== null;
  const hasValidCategory = category !== 'Other';
  const hasLocation = /at\s+\w+|from\s+\w+|to\s+\w+/i.test(transcript);
  
  let finalConfidence = confidence;
  if (hasAmount) finalConfidence += 0.2;
  if (hasValidCategory) finalConfidence += 0.1;
  if (hasLocation) finalConfidence += 0.05;
  
  finalConfidence = Math.min(finalConfidence, 1.0);

  return {
    amount,
    currency: 'INR',
    category,
    description: transcript,
    date,
    type,
    confidence: finalConfidence,
    metadata: {
      hasAmount,
      hasValidCategory,
      hasLocation,
      extractedPatterns: {
        amount: amountMatch ? amountMatch[0] : null,
        category_matched: category !== 'Other'
      }
    }
  };
}