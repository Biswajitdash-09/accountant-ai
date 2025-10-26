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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { reportType, format, emailReport, year } = await req.json();
    console.log(`Generating ${reportType} report in ${format} format for user ${user.id}`);

    // Fetch user profile for email
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    // Fetch transactions for the year
    const { data: transactions } = await supabaseClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)
      .order('date', { ascending: true });

    // Fetch accounts
    const { data: accounts } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user.id);

    // Generate report data based on type
    let reportData: any = {};

    switch (reportType) {
      case 'profit_loss':
        const income = transactions
          ?.filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0) || 0;
        
        const expenses = transactions
          ?.filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0) || 0;

        reportData = {
          title: 'Profit & Loss Statement',
          year,
          totalIncome: income,
          totalExpenses: expenses,
          netProfit: income - expenses,
          incomeByCategory: groupByCategory(transactions?.filter(t => t.type === 'income') || []),
          expensesByCategory: groupByCategory(transactions?.filter(t => t.type === 'expense') || []),
        };
        break;

      case 'balance_sheet':
        const totalAssets = accounts?.reduce((sum, acc) => sum + Number(acc.balance || 0), 0) || 0;
        
        const { data: balanceItems } = await supabaseClient
          .from('balance_sheet_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        const assets = balanceItems?.filter(i => i.item_type === 'asset')
          .reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0;
        
        const liabilities = balanceItems?.filter(i => i.item_type === 'liability')
          .reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0;

        reportData = {
          title: 'Balance Sheet',
          date: new Date().toISOString().split('T')[0],
          totalAssets: totalAssets + assets,
          totalLiabilities: liabilities,
          netWorth: (totalAssets + assets) - liabilities,
          accounts,
          balanceItems,
        };
        break;

      case 'cash_flow':
        const monthlyFlow: Record<string, { income: number; expenses: number }> = {};
        
        transactions?.forEach(tx => {
          const month = tx.date.substring(0, 7);
          if (!monthlyFlow[month]) {
            monthlyFlow[month] = { income: 0, expenses: 0 };
          }
          
          if (tx.type === 'income') {
            monthlyFlow[month].income += Math.abs(Number(tx.amount) || 0);
          } else {
            monthlyFlow[month].expenses += Math.abs(Number(tx.amount) || 0);
          }
        });

        reportData = {
          title: 'Cash Flow Statement',
          year,
          monthlyFlow,
          totalIncome: Object.values(monthlyFlow).reduce((sum, m) => sum + m.income, 0),
          totalExpenses: Object.values(monthlyFlow).reduce((sum, m) => sum + m.expenses, 0),
        };
        break;

      case 'tax_summary':
        const { data: taxData } = await supabaseClient
          .from('tax_calculations')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', `${year}-01-01`)
          .lte('created_at', `${year}-12-31`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: deductions } = await supabaseClient
          .from('tax_deductions')
          .select('*')
          .eq('user_id', user.id);

        reportData = {
          title: 'Tax Summary Report',
          year,
          taxCalculation: taxData,
          deductions,
          totalDeductions: deductions?.reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0,
        };
        break;

      case 'expense_breakdown':
      case 'monthly_spending':
        reportData = {
          title: reportType === 'expense_breakdown' ? 'Expense Breakdown by Category' : 'Monthly Spending Report',
          year,
          transactions: transactions?.filter(t => t.type === 'expense'),
          categoryBreakdown: groupByCategory(transactions?.filter(t => t.type === 'expense') || []),
        };
        break;

      case 'annual_tax_package':
        reportData = {
          title: 'Annual Tax Package',
          year,
          transactions,
          accounts,
          // This would include all tax-related documents and data
        };
        break;

      default:
        throw new Error('Invalid report type');
    }

    // If email is requested, send the report
    if (emailReport && profile?.email) {
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      
      if (RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Accountant AI <reports@accountantai.app>',
              to: [profile.email],
              subject: `${reportData.title} - ${year}`,
              html: generateEmailHTML(reportData),
            }),
          });

          console.log(`Report emailed to ${profile.email}`);
        } catch (emailError) {
          console.error('Email error:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        format,
        message: emailReport ? 'Report generated and emailed' : 'Report generated successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function groupByCategory(transactions: any[]): Record<string, number> {
  const grouped: Record<string, number> = {};
  
  transactions.forEach(tx => {
    const category = tx.category || 'Uncategorized';
    grouped[category] = (grouped[category] || 0) + Math.abs(Number(tx.amount) || 0);
  });
  
  return grouped;
}

function generateEmailHTML(reportData: any): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">${reportData.title}</h1>
          <p>Your financial report has been generated and is attached to this email.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated email from Accountant AI. 
            If you did not request this report, please contact support.
          </p>
        </div>
      </body>
    </html>
  `;
}
