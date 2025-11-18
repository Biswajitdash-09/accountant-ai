import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { payment_id, subscription_id } = await req.json();

    // Generate unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    let amount, currency, paymentId, subscriptionId;

    if (payment_id) {
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('id', payment_id)
        .single();

      if (!payment) throw new Error('Payment not found');
      
      amount = payment.amount;
      currency = payment.currency;
      paymentId = payment_id;
    } else if (subscription_id) {
      const { data: subscription } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('id', subscription_id)
        .single();

      if (!subscription) throw new Error('Subscription not found');
      
      amount = subscription.amount;
      currency = subscription.currency;
      subscriptionId = subscription_id;
    } else {
      throw new Error('Either payment_id or subscription_id is required');
    }

    // Create invoice record
    const { data: invoice, error } = await supabaseClient
      .from('invoices')
      .insert({
        user_id: user.id,
        payment_id: paymentId,
        subscription_id: subscriptionId,
        invoice_number: invoiceNumber,
        amount,
        currency,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Generate PDF (simplified - in production use jsPDF or similar)
    const pdfContent = generateInvoiceHTML(invoice, user);
    
    // In production, you would:
    // 1. Generate actual PDF using jsPDF
    // 2. Upload to Supabase Storage
    // 3. Update invoice with PDF URL
    
    // For now, return invoice data
    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice,
        html: pdfContent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Invoice generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateInvoiceHTML(invoice: any, user: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .total { font-weight: bold; font-size: 18px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <p>Invoice #: ${invoice.invoice_number}</p>
        <p>Date: ${new Date(invoice.created_at).toLocaleDateString()}</p>
      </div>
      
      <div class="invoice-details">
        <p><strong>Bill To:</strong></p>
        <p>${user.email}</p>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Accountant AI Credits</td>
            <td>${invoice.currency.toUpperCase()} ${invoice.amount}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total">
            <td>Total</td>
            <td>${invoice.currency.toUpperCase()} ${invoice.amount}</td>
          </tr>
        </tfoot>
      </table>
      
      <p style="margin-top: 30px; text-align: center;">Thank you for your business!</p>
    </body>
    </html>
  `;
}
