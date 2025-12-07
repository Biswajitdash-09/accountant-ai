import { supabase } from '@/integrations/supabase/client';

export interface VoiceActionResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

// Execute voice agent tool calls
export const executeVoiceAction = async (
  actionName: string,
  args: Record<string, any>
): Promise<VoiceActionResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    switch (actionName) {
      case 'generate_report':
        return await generateReport(user.id, args as any);

      case 'analyze_spending':
        return await analyzeSpending(user.id, args as any);

      case 'calculate_tax':
        return await calculateTax(user.id, args as any);

      case 'forecast_cashflow':
        return await forecastCashflow(user.id, args as any);

      case 'create_transaction':
        return await createTransaction(user.id, args as any);

      case 'get_account_summary':
        return await getAccountSummary(user.id, args as any);

      case 'search_transactions':
        return await searchTransactions(user.id, args as any);

      case 'set_budget':
        return await setBudget(user.id, args as any);

      default:
        return { success: false, error: `Unknown action: ${actionName}` };
    }
  } catch (error) {
    console.error(`Error executing ${actionName}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

async function generateReport(userId: string, args: { report_type: string; period: string; format?: string }): Promise<VoiceActionResult> {
  const { data, error } = await supabase.functions.invoke('arnold-generate-report', {
    body: {
      userId,
      reportType: args.report_type,
      dateRange: getPeriodDates(args.period),
      format: args.format || 'summary'
    }
  });

  if (error) return { success: false, error: error.message };
  
  return {
    success: true,
    data: data,
    message: `Generated ${args.report_type} report for ${args.period}`
  };
}

async function analyzeSpending(userId: string, args: { timeframe: string; category?: string }): Promise<VoiceActionResult> {
  const { data, error } = await supabase.functions.invoke('ai-analyze-spending', {
    body: {
      userId,
      timeframe: args.timeframe,
      category: args.category
    }
  });

  if (error) return { success: false, error: error.message };
  
  return {
    success: true,
    data: data,
    message: `Spending analysis for ${args.timeframe}${args.category ? ` in ${args.category}` : ''}`
  };
}

async function calculateTax(userId: string, args: { tax_year: number; region: string; include_investments?: boolean }): Promise<VoiceActionResult> {
  const { data, error } = await supabase.functions.invoke('arnold-tax-optimizer-universal', {
    body: {
      userId,
      region: args.region,
      taxYear: args.tax_year,
      includeInvestments: args.include_investments || false
    }
  });

  if (error) return { success: false, error: error.message };
  
  return {
    success: true,
    data: data,
    message: `Tax calculation for ${args.tax_year} (${args.region.toUpperCase()})`
  };
}

async function forecastCashflow(userId: string, args: { months_ahead: number; include_recurring?: boolean }): Promise<VoiceActionResult> {
  const { data, error } = await supabase.functions.invoke('ai-forecast-cashflow', {
    body: {
      userId,
      months: Math.min(12, Math.max(1, args.months_ahead)),
      includeRecurring: args.include_recurring !== false
    }
  });

  if (error) return { success: false, error: error.message };
  
  return {
    success: true,
    data: data,
    message: `Cash flow forecast for the next ${args.months_ahead} months`
  };
}

async function createTransaction(userId: string, args: {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date?: string;
}): Promise<VoiceActionResult> {
  const transactionDate = args.date || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: args.type,
      amount: args.amount,
      category: args.category,
      description: args.description || `${args.category} transaction`,
      transaction_date: transactionDate
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  return {
    success: true,
    data: data,
    message: `Created ${args.type} of ${args.amount} for ${args.category}`
  };
}

async function getAccountSummary(userId: string, args: { account_type?: string }): Promise<VoiceActionResult> {
  let query = supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);

  if (args.account_type && args.account_type !== 'all') {
    query = query.eq('account_type', args.account_type);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };

  const totalBalance = data?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  
  return {
    success: true,
    data: {
      accounts: data,
      totalBalance,
      accountCount: data?.length || 0
    },
    message: `Found ${data?.length || 0} accounts with total balance of ${totalBalance}`
  };
}

async function searchTransactions(userId: string, args: {
  query?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
}): Promise<VoiceActionResult> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .limit(20);

  if (args.start_date) {
    query = query.gte('transaction_date', args.start_date);
  }
  if (args.end_date) {
    query = query.lte('transaction_date', args.end_date);
  }
  if (args.min_amount) {
    query = query.gte('amount', args.min_amount);
  }
  if (args.max_amount) {
    query = query.lte('amount', args.max_amount);
  }
  if (args.query) {
    query = query.or(`description.ilike.%${args.query}%,category.ilike.%${args.query}%`);
  }

  const { data, error } = await query;

  if (error) return { success: false, error: error.message };
  
  return {
    success: true,
    data: data,
    message: `Found ${data?.length || 0} transactions`
  };
}

async function setBudget(userId: string, args: {
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}): Promise<VoiceActionResult> {
  // Calculate date range based on period
  const now = new Date();
  let startDate: Date, endDate: Date;
  
  switch (args.period) {
    case 'weekly':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
  }

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: userId,
      name: `${args.category} Budget`,
      total_budget: args.amount,
      budget_period: args.period,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      categories: { [args.category]: args.amount } as any,
      is_active: true
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  return {
    success: true,
    data: data,
    message: `Set ${args.period} budget of ${args.amount} for ${args.category}`
  };
}

// Helper function to get date range from period string
function getPeriodDates(period: string): { start: string; end: string } {
  const now = new Date();
  let start: Date, end: Date;

  switch (period) {
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'this_quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStart, 1);
      end = new Date(now.getFullYear(), quarterStart + 3, 0);
      break;
    case 'last_quarter':
      const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3;
      start = new Date(now.getFullYear(), lastQuarterStart, 1);
      end = new Date(now.getFullYear(), lastQuarterStart + 3, 0);
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    case 'last_year':
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}
