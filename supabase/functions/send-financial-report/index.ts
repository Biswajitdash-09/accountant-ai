import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ReportRequest {
  email: string;
  reportName: string;
  dataTypes: string[];
  startDate?: string;
  endDate?: string;
  format: 'pdf' | 'excel' | 'html';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const reportData: ReportRequest = await req.json();
    console.log(`Generating financial report for user: ${user.id}`);

    // Fetch requested data types
    const financialData: any = {};

    if (reportData.dataTypes.includes('accounts')) {
      const { data: accounts } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
      financialData.accounts = accounts || [];
    }

    if (reportData.dataTypes.includes('transactions')) {
      let query = supabaseClient
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (reportData.startDate) {
        query = query.gte('date', reportData.startDate);
      }
      if (reportData.endDate) {
        query = query.lte('date', reportData.endDate);
      }

      const { data: transactions } = await query;
      financialData.transactions = transactions || [];
    }

    if (reportData.dataTypes.includes('budgets')) {
      const { data: budgets } = await supabaseClient
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);
      financialData.budgets = budgets || [];
    }

    if (reportData.dataTypes.includes('goals')) {
      const { data: goals } = await supabaseClient
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id);
      financialData.goals = goals || [];
    }

    if (reportData.dataTypes.includes('tax')) {
      const { data: taxCalcs } = await supabaseClient
        .from('tax_calculations')
        .select('*')
        .eq('user_id', user.id);
      financialData.taxCalculations = taxCalcs || [];
    }

    // Generate HTML email content
    const htmlContent = generateEmailHTML(reportData.reportName, financialData);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "FinanceHub <reports@yourdomain.com>",
      to: [reportData.email],
      subject: `Your Financial Report: ${reportData.reportName}`,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Financial report sent successfully',
        emailId: emailResponse.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Send report error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function generateEmailHTML(reportName: string, data: any): string {
  const sections: string[] = [];

  if (data.accounts) {
    const totalBalance = data.accounts.reduce((sum: number, acc: any) => sum + Number(acc.balance || 0), 0);
    sections.push(`
      <div style="margin: 20px 0;">
        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Accounts Summary</h2>
        <p style="font-size: 18px; color: #666;"><strong>Total Accounts:</strong> ${data.accounts.length}</p>
        <p style="font-size: 18px; color: #666;"><strong>Total Balance:</strong> $${totalBalance.toFixed(2)}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Account Name</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #e5e7eb;">Type</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${data.accounts.map((acc: any) => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${acc.account_name}</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${acc.account_type}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #e5e7eb;">$${Number(acc.balance || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `);
  }

  if (data.transactions) {
    const totalIncome = data.transactions.filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const totalExpense = data.transactions.filter((t: any) => t.type === 'expense').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    
    sections.push(`
      <div style="margin: 20px 0;">
        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Transactions Summary</h2>
        <p style="font-size: 18px; color: #10b981;"><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
        <p style="font-size: 18px; color: #ef4444;"><strong>Total Expenses:</strong> $${totalExpense.toFixed(2)}</p>
        <p style="font-size: 18px; color: #666;"><strong>Net:</strong> $${(totalIncome - totalExpense).toFixed(2)}</p>
        <p style="color: #666;">Total Transactions: ${data.transactions.length}</p>
      </div>
    `);
  }

  if (data.budgets) {
    sections.push(`
      <div style="margin: 20px 0;">
        <h2 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Budgets</h2>
        ${data.budgets.map((budget: any) => {
          const percentUsed = ((budget.actual_spent / budget.total_budget) * 100).toFixed(1);
          return `
            <div style="margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${budget.name}</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Budget:</strong> $${Number(budget.total_budget).toFixed(2)}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Spent:</strong> $${Number(budget.actual_spent).toFixed(2)} (${percentUsed}%)</p>
              <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: ${Number(percentUsed) > 100 ? '#ef4444' : '#4F46E5'}; height: 100%; width: ${Math.min(Number(percentUsed), 100)}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `);
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">📊 ${reportName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
      
      ${sections.join('')}
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 14px;">
        <p>This is an automated financial report from FinanceHub.</p>
        <p>For any questions or concerns, please contact support.</p>
      </div>
    </body>
    </html>
  `;
}
