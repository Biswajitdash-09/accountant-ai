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
      const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

      console.log('Audio file downloaded, size:', audioBuffer.byteLength);

      // Use OpenAI Whisper for real transcription
      const transcript = await transcribeWithWhisper(audioBlob);
      
      console.log('Transcription result:', transcript);

      // Parse the transcript for transaction data
      const parsed = await parseTranscriptForTransaction(transcript);

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
          transcript,
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

// Real transcription using OpenAI Whisper API
async function transcribeWithWhisper(audioBlob: Blob): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    console.warn('OPENAI_API_KEY not configured, using fallback transcription');
    return fallbackTranscription();
  }

  try {
    // Convert blob to form data for OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en'); // Can be changed based on user preference
    formData.append('response_format', 'text');

    console.log('Sending audio to OpenAI Whisper API...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', response.status, errorText);
      throw new Error(`Whisper API error: ${response.status} - ${errorText}`);
    }

    const transcript = await response.text();
    console.log('Whisper transcription successful:', transcript);
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Empty transcription received');
    }
    
    return transcript.trim();
  } catch (error) {
    console.error('Whisper transcription failed:', error);
    throw error;
  }
}

// Fallback if Whisper fails (should rarely be used)
function fallbackTranscription(): string {
  console.warn('Using fallback - no real transcription available');
  return "Unable to transcribe audio. Please try again or type your transaction details.";
}

// Parse transcript to extract transaction data
async function parseTranscriptForTransaction(transcript: string) {
  // Try to use AI for better parsing
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (lovableApiKey) {
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'system',
              content: `You are a financial transaction parser. Extract transaction details from user speech.
              Return a JSON object with:
              - amount: number (the monetary amount)
              - currency: string (INR, USD, EUR, GBP, NGN, etc. - default to INR if not specified)
              - category: string (Food, Transport, Shopping, Bills, Healthcare, Entertainment, Other)
              - description: string (brief description of the transaction)
              - date: string (YYYY-MM-DD format, use today if not specified)
              - type: string (expense or income)
              - confidence: number (0-1, how confident you are in the extraction)
              
              Only respond with valid JSON. If you can't extract meaningful transaction data, return {"confidence": 0}`
            },
            {
              role: 'user',
              content: `Extract transaction details from: "${transcript}"`
            }
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (content) {
          // Extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('AI parsed transaction:', parsed);
            return parsed;
          }
        }
      }
    } catch (error) {
      console.error('AI parsing failed, using regex fallback:', error);
    }
  }

  // Fallback to regex-based parsing
  return parseWithRegex(transcript);
}

// Regex-based parsing as fallback
function parseWithRegex(transcript: string) {
  // Amount patterns - support multiple currencies
  const amountPatterns = [
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:rupees?|rs\.?|inr)/i,
    /(?:rupees?|rs\.?|inr)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|usd)/i,
    /₦(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:naira|ngn)/i,
    /(\d+(?:\.\d{2})?)/i, // Fallback: any number
  ];

  let amount = null;
  let currency = 'INR'; // Default currency

  for (const pattern of amountPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      
      // Detect currency from the pattern match
      if (/\$|dollar|usd/i.test(match[0])) currency = 'USD';
      else if (/₦|naira|ngn/i.test(match[0])) currency = 'NGN';
      else if (/€|euro/i.test(match[0])) currency = 'EUR';
      else if (/£|pound|gbp/i.test(match[0])) currency = 'GBP';
      
      break;
    }
  }

  // Category detection
  let category = 'Other';
  let confidence = 0.5;
  
  const categoryPatterns: Record<string, { patterns: RegExp[], confidence: number }> = {
    'Food': {
      patterns: [/hotel|restaurant|cafe|dinner|lunch|breakfast|food|snacks|barbeque|dining|coffee|tea|meal|eat/i],
      confidence: 0.9
    },
    'Transport': {
      patterns: [/taxi|uber|ola|auto|rickshaw|bus|train|metro|petrol|fuel|toll|airport|cab|ride|fare|travel/i],
      confidence: 0.9
    },
    'Shopping': {
      patterns: [/shopping|amazon|flipkart|store|mall|grocery|megastore|accessories|electronic|clothes|buy|purchase|order/i],
      confidence: 0.85
    },
    'Bills': {
      patterns: [/bill|electricity|water|gas|phone|internet|payment|paytm|rent|subscription|utility/i],
      confidence: 0.9
    },
    'Healthcare': {
      patterns: [/medical|doctor|clinic|hospital|consultation|checkup|apollo|medicine|pharmacy|health/i],
      confidence: 0.9
    },
    'Entertainment': {
      patterns: [/movie|cinema|netflix|game|concert|show|entertainment|fun|party/i],
      confidence: 0.85
    }
  };

  for (const [cat, config] of Object.entries(categoryPatterns)) {
    if (config.patterns.some(pattern => pattern.test(transcript))) {
      category = cat;
      confidence = Math.max(confidence, config.confidence);
      break;
    }
  }

  // Date detection
  let date = new Date().toISOString().split('T')[0];
  if (/yesterday/i.test(transcript)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split('T')[0];
  } else if (/last\s*(week|night)/i.test(transcript)) {
    date = new Date().toISOString().split('T')[0];
  }

  // Determine transaction type
  const type = /received|income|salary|payment\s*received|got|earned|credited/i.test(transcript) 
    ? 'income' 
    : 'expense';

  // Calculate overall confidence
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
    currency,
    category,
    description: transcript,
    date,
    type,
    confidence: finalConfidence,
    metadata: {
      hasAmount,
      hasValidCategory,
      hasLocation,
      parsingMethod: 'regex'
    }
  };
}