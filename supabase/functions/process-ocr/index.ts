
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

    const { document_id } = await req.json();
    
    if (!document_id) {
      return new Response(
        JSON.stringify({ error: 'document_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify document ownership before processing
    const { data: document, error: fetchError } = await serviceSupabase
      .from('documents')
      .select('user_id, storage_path, file_type')
      .eq('id', document_id)
      .single();

    if (fetchError || !document) {
      console.error('Error fetching document:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Document not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (document.user_id !== user.id) {
      console.log(`Access denied: user ${user.id} tried to access document ${document_id} owned by ${document.user_id}`);
      return new Response(
        JSON.stringify({ error: 'Access denied: Document not owned by user' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to processing
    await serviceSupabase
      .from('documents')
      .update({ processing_status: 'processing' })
      .eq('id', document_id);

    try {
      // Get signed URL for the document
      const { data: signedUrlData } = await serviceSupabase.storage
        .from('documents')
        .createSignedUrl(document.storage_path, 3600);

      if (!signedUrlData?.signedUrl) {
        throw new Error('Could not create signed URL for document');
      }

      // Download and process the document
      const documentResponse = await fetch(signedUrlData.signedUrl);
      const documentBuffer = await documentResponse.arrayBuffer();

      // Perform OCR (simulated with enhanced extraction)
      const ocrText = await performEnhancedOCR(documentBuffer, document.file_type);
      
      // Classify document type
      const documentType = classifyDocument(ocrText);
      
      // Extract structured data using AI
      const extractedData = await extractStructuredData(ocrText, documentType);
      
      // Calculate AI confidence score
      const aiConfidence = calculateConfidenceScore(extractedData, ocrText);

      // Update document with results
      await serviceSupabase
        .from('documents')
        .update({
          processing_status: 'completed',
          extracted_text: ocrText,
          category: documentType,
          ai_confidence: aiConfidence,
          processed_at: new Date().toISOString()
        })
        .eq('id', document_id);

      // Store OCR results in AI analysis table instead of returning sensitive data
      const { error: insertError } = await serviceSupabase
        .from('document_ai_analysis')
        .insert({
          document_id,
          user_id: user.id,
          analysis_type: 'ocr',
          confidence_score: aiConfidence,
          extracted_data: extractedData,
          suggested_categorization: { 
            category: documentType, 
            confidence: aiConfidence 
          }
        });

      if (insertError) {
        console.error('Failed to store OCR results:', insertError);
      }

      // Create transactions if extraction was successful and confidence is high
      if (extractedData.transactions && aiConfidence >= 0.7) {
        for (const transaction of extractedData.transactions) {
          await serviceSupabase
            .from('transactions')
            .insert({
              user_id: user.id,
              amount: transaction.amount,
              currency: transaction.currency || 'INR',
              category: transaction.category || documentType,
              description: `${documentType} - ${transaction.description}`,
              date: transaction.date || new Date().toISOString().split('T')[0],
              type: 'expense',
            });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'OCR processing completed',
          document_id,
          confidence: aiConfidence
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Processing error:', error);
      
      await serviceSupabase
        .from('documents')
        .update({
          processing_status: 'failed',
          processed_at: new Date().toISOString()
        })
        .eq('id', document_id);

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

// Real OCR using OpenAI Vision API
async function performEnhancedOCR(documentBuffer: ArrayBuffer, fileType: string): Promise<string> {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    throw new Error('OCR service not available');
  }

  try {
    // Convert buffer to base64
    const base64Image = btoa(
      new Uint8Array(documentBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const mimeType = fileType.includes('pdf') ? 'application/pdf' : `image/${fileType.replace('.', '')}`;
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Call OpenAI Vision API with structured extraction
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract ALL text, numbers, and financial figures from this document with 100% accuracy. 
              Pay special attention to:
              - All monetary amounts and their labels
              - Dates (transaction date, due date, etc.)
              - Vendor/merchant names
              - Tax IDs, GST numbers, invoice numbers
              - Line items with quantities and prices
              - Subtotals, taxes, and final totals
              - Payment methods
              
              Return the text exactly as it appears in the document, preserving formatting and structure.`
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl }
            }
          ]
        }],
        max_completion_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OCR API failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content;
    
    if (!extractedText) {
      throw new Error('No text extracted from document');
    }

    console.log('OCR extracted text length:', extractedText.length);
    return extractedText;
    
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
}

// Document classification based on OCR text
function classifyDocument(ocrText: string): string {
  const patterns = {
    'Restaurant Receipt': [/hotel|restaurant|dining|table|biryani|masala|naan/i],
    'Grocery Receipt': [/fresh|grocery|rice|dal|oil|onions|potatoes|tomatoes/i],
    'Medical Bill': [/clinic|hospital|doctor|patient|consultation|lab tests|medicines/i],
    'Fuel Receipt': [/petrol|fuel|pump|station|vehicle|quantity|rate/i],
    'Utility Bill': [/electricity|water|gas|bill|units|reading/i],
    'Invoice': [/invoice|gstin|bill no|tax invoice/i],
    'Receipt': [/receipt|bill|payment|total/i]
  };

  for (const [type, typePatterns] of Object.entries(patterns)) {
    if (typePatterns.some(pattern => pattern.test(ocrText))) {
      return type;
    }
  }

  return 'General Document';
}

// Extract structured data from OCR text
async function extractStructuredData(ocrText: string, documentType: string) {
  // Extract amounts
  const amountMatches = ocrText.match(/₹[\d,]+\.?\d*/g) || [];
  const amounts = amountMatches.map(match => 
    parseFloat(match.replace('₹', '').replace(/,/g, ''))
  );

  // Find the largest amount as likely total
  const totalAmount = amounts.length > 0 ? Math.max(...amounts) : null;

  // Extract GSTIN if present
  const gstinMatch = ocrText.match(/GSTIN:\s*([A-Z0-9]{15})/i);
  const gstin = gstinMatch ? gstinMatch[1] : null;

  // Extract date
  const dateMatch = ocrText.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/);
  const date = dateMatch ? formatDate(dateMatch[1]) : new Date().toISOString().split('T')[0];

  // Extract vendor name (first line often contains vendor name)
  const lines = ocrText.split('\n').filter(line => line.trim());
  const vendorName = lines[0]?.trim() || 'Unknown Vendor';

  // Create transactions based on document type
  const transactions = [];
  if (totalAmount) {
    transactions.push({
      amount: totalAmount,
      currency: 'INR',
      category: mapDocumentTypeToCategory(documentType),
      description: `${documentType} - ${vendorName}`,
      date,
      metadata: {
        vendor: vendorName,
        gstin,
        documentType,
        rawAmounts: amounts
      }
    });
  }

  return {
    vendorName,
    gstin,
    totalAmount,
    date,
    documentType,
    transactions,
    rawData: {
      extractedAmounts: amounts,
      ocrLineCount: lines.length
    }
  };
}

// Calculate confidence score based on extracted data quality
function calculateConfidenceScore(extractedData: any, ocrText: string): number {
  let score = 0.0;

  // Check for amount extraction (40% weight)
  if (extractedData.totalAmount && extractedData.totalAmount > 0) {
    score += 0.4;
  }

  // Check for vendor name (20% weight)
  if (extractedData.vendorName && extractedData.vendorName !== 'Unknown Vendor') {
    score += 0.2;
  }

  // Check for date (15% weight)
  if (extractedData.date) {
    score += 0.15;
  }

  // Check for GSTIN (10% weight)
  if (extractedData.gstin) {
    score += 0.1;
  }

  // Check for document type classification (15% weight)
  if (extractedData.documentType && extractedData.documentType !== 'General Document') {
    score += 0.15;
  }

  // Bonus for structured content
  const hasStructuredContent = /total|subtotal|amount|payment/i.test(ocrText);
  if (hasStructuredContent) {
    score += 0.05;
  }

  return Math.min(score, 1.0);
}

// Map document types to transaction categories
function mapDocumentTypeToCategory(documentType: string): string {
  const mapping: { [key: string]: string } = {
    'Restaurant Receipt': 'Food',
    'Grocery Receipt': 'Shopping',
    'Medical Bill': 'Healthcare',
    'Fuel Receipt': 'Transport',
    'Utility Bill': 'Bills',
    'Invoice': 'Business',
    'Receipt': 'Other'
  };

  return mapping[documentType] || 'Other';
}

// Format date from various formats to YYYY-MM-DD
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString.replace(/[\/\-]/g, '/'));
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}
