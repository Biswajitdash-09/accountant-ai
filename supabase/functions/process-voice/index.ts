
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

    const { entry_id } = await req.json();
    
    if (!entry_id) {
      return new Response(
        JSON.stringify({ error: 'entry_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the voice entry
    const { data: entry, error: fetchError } = await supabase
      .from('voice_entries')
      .select('*')
      .eq('id', entry_id)
      .single();

    if (fetchError || !entry) {
      console.error('Error fetching voice entry:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Voice entry not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to processing
    await supabase
      .from('voice_entries')
      .update({ status: 'processing' })
      .eq('id', entry_id);

    try {
      // Get signed URL for the audio file
      const { data: signedUrlData } = await supabase.storage
        .from('voice')
        .createSignedUrl(entry.storage_path, 3600);

      if (!signedUrlData?.signedUrl) {
        throw new Error('Could not create signed URL for audio file');
      }

      // Download the audio file
      const audioResponse = await fetch(signedUrlData.signedUrl);
      const audioBuffer = await audioResponse.arrayBuffer();

      // For now, we'll simulate OpenAI Whisper API call
      // In production, you'd call the actual OpenAI API here
      const transcript = await simulateWhisperAPI(audioBuffer);
      
      // Parse the transcript using AI (simulated for now)
      const parsed = await parseTransactionFromText(transcript);

      // Update voice entry with results
      await supabase
        .from('voice_entries')
        .update({
          status: 'done',
          transcript,
          parsed,
          processed_at: new Date().toISOString()
        })
        .eq('id', entry_id);

      // Create transaction if parsing was successful
      if (parsed && parsed.amount) {
        await supabase
          .from('transactions')
          .insert({
            user_id: entry.user_id,
            amount: parsed.amount,
            currency: parsed.currency || 'INR',
            category: parsed.category || 'Other',
            description: parsed.description || transcript,
            date: parsed.date || new Date().toISOString().split('T')[0],
            type: 'expense',
            voice_entry_id: entry_id,
            confidence_score: parsed.confidence || 0.8
          });
      }

      return new Response(
        JSON.stringify({ success: true, transcript, parsed }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Processing error:', error);
      
      await supabase
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

// Simulate OpenAI Whisper API for demo purposes
async function simulateWhisperAPI(audioBuffer: ArrayBuffer): Promise<string> {
  // In production, this would be:
  // const formData = new FormData();
  // formData.append('file', new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }));
  // formData.append('model', 'whisper-1');
  // 
  // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
  //   },
  //   body: formData,
  // });
  // 
  // const result = await response.json();
  // return result.text;

  // For demo, return simulated transcripts
  const sampleTranscripts = [
    "I spent 1249 rupees on Zomato yesterday for lunch",
    "Paid 500 rupees for taxi to airport today",
    "Bought groceries for 2500 rupees at Big Bazaar",
    "Coffee shop bill was 350 rupees this morning",
    "Electricity bill payment of 1800 rupees done online"
  ];
  
  return sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
}

// Parse transaction details from transcript
async function parseTransactionFromText(transcript: string) {
  // In production, this would use GPT-4 or similar:
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-4',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: 'Extract transaction details from text. Return JSON with: amount, currency, category, description, date. Categories: Food, Transport, Shopping, Bills, Other.'
  //       },
  //       {
  //         role: 'user',
  //         content: transcript
  //       }
  //     ],
  //     temperature: 0
  //   })
  // });

  // For demo, use simple regex and pattern matching
  const amountMatch = transcript.match(/(\d+(?:\.\d{2})?)\s*rupees?/i);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : null;

  let category = 'Other';
  if (/zomato|swiggy|food|lunch|dinner|restaurant|cafe|coffee/i.test(transcript)) {
    category = 'Food';
  } else if (/taxi|uber|ola|transport|bus|train|metro/i.test(transcript)) {
    category = 'Transport';
  } else if (/grocery|shopping|mall|bazaar|store/i.test(transcript)) {
    category = 'Shopping';
  } else if (/bill|electricity|water|gas|phone|internet/i.test(transcript)) {
    category = 'Bills';
  }

  let date = new Date().toISOString().split('T')[0];
  if (/yesterday/i.test(transcript)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date = yesterday.toISOString().split('T')[0];
  }

  return {
    amount,
    currency: 'INR',
    category,
    description: transcript,
    date,
    confidence: 0.85
  };
}
