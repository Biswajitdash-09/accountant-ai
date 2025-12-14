import { supabase } from '@/integrations/supabase/client';

export interface VoiceActionResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  retryable?: boolean;
}

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Execute voice agent tool calls with retry logic
export const executeVoiceAction = async (
  actionName: string,
  args: Record<string, any>
): Promise<VoiceActionResult> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      success: false, 
      error: 'Please sign in to use this feature',
      retryable: false 
    };
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await executeActionWithHandler(actionName, user.id, args);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry for certain errors
      if (isNonRetryableError(lastError)) {
        break;
      }
      
      // Wait before retry
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  return { 
    success: false, 
    error: lastError?.message || 'Action failed after retries',
    retryable: true
  };
};

function isNonRetryableError(error: Error): boolean {
  const nonRetryableMessages = [
    'not authenticated',
    'permission denied',
    'invalid',
    'not found'
  ];
  
  return nonRetryableMessages.some(msg => 
    error.message.toLowerCase().includes(msg)
  );
}

async function executeActionWithHandler(
  actionName: string,
  userId: string,
  args: Record<string, any>
): Promise<VoiceActionResult> {
  switch (actionName) {
    case 'generate_report':
      return await generateReport(userId, args as any);

    case 'analyze_spending':
      return await analyzeSpending(userId, args as any);

    case 'calculate_tax':
      return await calculateTax(userId, args as any);

    case 'forecast_cashflow':
      return await forecastCashflow(userId, args as any);

    case 'create_transaction':
      return await createTransaction(userId, args as any);

    case 'get_account_summary':
      return await getAccountSummary(userId, args as any);

    case 'search_transactions':
      return await searchTransactions(userId, args as any);

    case 'set_budget':
      return await setBudget(userId, args as any);

    default:
      return { 
        success: false, 
        error: `I don't know how to handle "${actionName}" yet.`,
        retryable: false
      };
  }
}

async function generateReport(
  userId: string, 
  args: { report_type: string; period: string; format?: string }
): Promise<VoiceActionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('arnold-generate-report', {
      body: {
        userId,
        reportType: args.report_type,
        dateRange: getPeriodDates(args.period),
        format: args.format || 'summary'
      }
    });

    if (error) {
      return { 
        success: false, 
        error: `Couldn't generate the report: ${error.message}`,
        retryable: true
      };
    }
    
    return {
      success: true,
      data: data,
      message: `Here's your ${formatReportType(args.report_type)} report for ${formatPeriod(args.period)}`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Report generation service is temporarily unavailable',
      retryable: true
    };
  }
}

async function analyzeSpending(
  userId: string, 
  args: { timeframe: string; category?: string }
): Promise<VoiceActionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-analyze-spending', {
      body: {
        userId,
        timeframe: args.timeframe,
        category: args.category
      }
    });

    if (error) {
      return { 
        success: false, 
        error: `Couldn't analyze spending: ${error.message}`,
        retryable: true
      };
    }
    
    return {
      success: true,
      data: data,
      message: `Analyzed your spending for ${formatTimeframe(args.timeframe)}${args.category ? ` in ${args.category}` : ''}`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Spending analysis is temporarily unavailable',
      retryable: true
    };
  }
}

async function calculateTax(
  userId: string, 
  args: { tax_year: number; region: string; include_investments?: boolean }
): Promise<VoiceActionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('arnold-tax-optimizer-universal', {
      body: {
        userId,
        region: args.region,
        taxYear: args.tax_year,
        includeInvestments: args.include_investments || false
      }
    });

    if (error) {
      return { 
        success: false, 
        error: `Couldn't calculate taxes: ${error.message}`,
        retryable: true
      };
    }
    
    return {
      success: true,
      data: data,
      message: `Calculated your ${args.tax_year} taxes for ${args.region.toUpperCase()}`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Tax calculation service is temporarily unavailable',
      retryable: true
    };
  }
}

async function forecastCashflow(
  userId: string, 
  args: { months_ahead: number; include_recurring?: boolean }
): Promise<VoiceActionResult> {
  try {
    const months = Math.min(12, Math.max(1, args.months_ahead));
    
    const { data, error } = await supabase.functions.invoke('ai-forecast-cashflow', {
      body: {
        userId,
        months,
        includeRecurring: args.include_recurring !== false
      }
    });

    if (error) {
      return { 
        success: false, 
        error: `Couldn't generate forecast: ${error.message}`,
        retryable: true
      };
    }
    
    return {
      success: true,
      data: data,
      message: `Forecast ready for the next ${months} month${months > 1 ? 's' : ''}`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Forecasting service is temporarily unavailable',
      retryable: true
    };
  }
}

async function createTransaction(userId: string, args: {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date?: string;
}): Promise<VoiceActionResult> {
  // Validate required fields
  if (!args.amount || args.amount <= 0) {
    return {
      success: false,
      error: 'Please provide a valid amount greater than zero',
      retryable: false
    };
  }
  
  if (!args.category) {
    return {
      success: false,
      error: 'Please specify a category for this transaction',
      retryable: false
    };
  }

  const transactionDate = args.date || new Date().toISOString().split('T')[0];
  
  // Get default currency
  const { data: currencies } = await supabase
    .from('currencies')
    .select('id')
    .eq('is_base', true)
    .limit(1);
  
  const defaultCurrencyId = currencies?.[0]?.id;
  
  if (!defaultCurrencyId) {
    return { 
      success: false, 
      error: 'Currency settings need to be configured first',
      retryable: false
    };
  }
  
  const transactionData: {
    user_id: string;
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    currency_id: string;
  } = {
    user_id: userId,
    type: args.type || 'expense',
    amount: Number(args.amount),
    category: args.category,
    description: args.description || `${args.category} transaction`,
    date: transactionDate,
    currency_id: defaultCurrencyId
  };
  
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) {
    return { 
      success: false, 
      error: `Couldn't create transaction: ${error.message}`,
      retryable: true
    };
  }
  
  return {
    success: true,
    data: data,
    message: `Created ${args.type} of ${formatCurrency(args.amount)} for ${args.category}`
  };
}

async function getAccountSummary(
  userId: string, 
  args: { account_type?: string }
): Promise<VoiceActionResult> {
  let query = supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId);

  if (args.account_type && args.account_type !== 'all') {
    query = query.eq('account_type', args.account_type);
  }

  const { data, error } = await query;

  if (error) {
    return { 
      success: false, 
      error: `Couldn't fetch accounts: ${error.message}`,
      retryable: true
    };
  }

  if (!data || data.length === 0) {
    return {
      success: true,
      data: { accounts: [], totalBalance: 0, accountCount: 0 },
      message: args.account_type && args.account_type !== 'all'
        ? `You don't have any ${args.account_type} accounts yet`
        : `You haven't added any accounts yet`
    };
  }

  const totalBalance = data.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  
  return {
    success: true,
    data: {
      accounts: data,
      totalBalance,
      accountCount: data.length
    },
    message: `You have ${data.length} account${data.length > 1 ? 's' : ''} with a total balance of ${formatCurrency(totalBalance)}`
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
    .order('date', { ascending: false })
    .limit(20);

  if (args.start_date) {
    query = query.gte('date', args.start_date);
  }
  if (args.end_date) {
    query = query.lte('date', args.end_date);
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

  if (error) {
    return { 
      success: false, 
      error: `Couldn't search transactions: ${error.message}`,
      retryable: true
    };
  }
  
  if (!data || data.length === 0) {
    return {
      success: true,
      data: [],
      message: 'No transactions found matching your criteria'
    };
  }
  
  return {
    success: true,
    data: data,
    message: `Found ${data.length} transaction${data.length > 1 ? 's' : ''}`
  };
}

async function setBudget(userId: string, args: {
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
}): Promise<VoiceActionResult> {
  // Validate
  if (!args.amount || args.amount <= 0) {
    return {
      success: false,
      error: 'Please provide a valid budget amount',
      retryable: false
    };
  }

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

  if (error) {
    return { 
      success: false, 
      error: `Couldn't set budget: ${error.message}`,
      retryable: true
    };
  }
  
  return {
    success: true,
    data: data,
    message: `Set a ${args.period} budget of ${formatCurrency(args.amount)} for ${args.category}`
  };
}

// Helper functions
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatReportType(type: string): string {
  const formats: Record<string, string> = {
    'income_expense': 'Income & Expense',
    'balance_sheet': 'Balance Sheet',
    'cashflow': 'Cash Flow',
    'tax_summary': 'Tax Summary',
    'investment_performance': 'Investment Performance'
  };
  return formats[type] || type;
}

function formatPeriod(period: string): string {
  const formats: Record<string, string> = {
    'this_month': 'this month',
    'last_month': 'last month',
    'this_quarter': 'this quarter',
    'last_quarter': 'last quarter',
    'this_year': 'this year',
    'last_year': 'last year'
  };
  return formats[period] || period;
}

function formatTimeframe(timeframe: string): string {
  const formats: Record<string, string> = {
    'last_7_days': 'the last 7 days',
    'last_30_days': 'the last 30 days',
    'last_3_months': 'the last 3 months',
    'last_year': 'the last year'
  };
  return formats[timeframe] || timeframe;
}
