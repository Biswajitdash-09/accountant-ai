// Demo data for Investor Demo Mode
// All data is tagged with is_demo: true for easy cleanup

export interface DemoBankConnection {
  id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
  provider: 'plaid' | 'truelayer' | 'mono' | 'setu';
  provider_account_id: string;
  status: string;
  last_sync_at: string;
  metadata: {
    is_demo: true;
    demo_session_id: string;
    demo_provider: string;
    demo_created_at: string;
    bank_name: string;
    bank_logo?: string;
    region: string;
  };
}

export interface DemoAccount {
  id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency_id: string | null;
  metadata?: {
    is_demo: true;
    demo_session_id: string;
  };
}

export interface DemoTransaction {
  id: string;
  account_id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  metadata: {
    is_demo: true;
    demo_session_id: string;
  };
}

// Generate a unique demo session ID
export const generateDemoSessionId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '_');
  const random = Math.random().toString(36).substring(2, 8);
  return `demo_${date}_${random}`;
};

// Demo Bank Connections (5 banks from different regions)
export const generateDemoBankConnections = (userId: string, sessionId: string): DemoBankConnection[] => {
  const now = new Date().toISOString();
  const lastSync = new Date(Date.now() - 1000 * 60 * 30).toISOString(); // 30 mins ago

  return [
    {
      id: `demo_bank_chase_${sessionId}`,
      account_name: 'Chase Business Checking',
      account_type: 'checking',
      balance: 45230.50,
      currency: 'USD',
      provider: 'plaid',
      provider_account_id: `plaid_demo_${sessionId}_1`,
      status: 'connected',
      last_sync_at: lastSync,
      metadata: {
        is_demo: true,
        demo_session_id: sessionId,
        demo_provider: 'plaid',
        demo_created_at: now,
        bank_name: 'Chase',
        region: 'US',
      },
    },
    {
      id: `demo_bank_boa_${sessionId}`,
      account_name: 'Bank of America Savings',
      account_type: 'savings',
      balance: 125000.00,
      currency: 'USD',
      provider: 'plaid',
      provider_account_id: `plaid_demo_${sessionId}_2`,
      status: 'connected',
      last_sync_at: lastSync,
      metadata: {
        is_demo: true,
        demo_session_id: sessionId,
        demo_provider: 'plaid',
        demo_created_at: now,
        bank_name: 'Bank of America',
        region: 'US',
      },
    },
    {
      id: `demo_bank_barclays_${sessionId}`,
      account_name: 'Barclays UK Premium',
      account_type: 'checking',
      balance: 32450.75,
      currency: 'GBP',
      provider: 'truelayer',
      provider_account_id: `truelayer_demo_${sessionId}_1`,
      status: 'connected',
      last_sync_at: lastSync,
      metadata: {
        is_demo: true,
        demo_session_id: sessionId,
        demo_provider: 'truelayer',
        demo_created_at: now,
        bank_name: 'Barclays',
        region: 'UK',
      },
    },
    {
      id: `demo_bank_gtbank_${sessionId}`,
      account_name: 'GTBank Nigeria Business',
      account_type: 'checking',
      balance: 2850000,
      currency: 'NGN',
      provider: 'mono',
      provider_account_id: `mono_demo_${sessionId}_1`,
      status: 'connected',
      last_sync_at: lastSync,
      metadata: {
        is_demo: true,
        demo_session_id: sessionId,
        demo_provider: 'mono',
        demo_created_at: now,
        bank_name: 'GTBank',
        region: 'Nigeria',
      },
    },
    {
      id: `demo_bank_hdfc_${sessionId}`,
      account_name: 'HDFC India Salary',
      account_type: 'savings',
      balance: 485000,
      currency: 'INR',
      provider: 'setu',
      provider_account_id: `setu_demo_${sessionId}_1`,
      status: 'connected',
      last_sync_at: lastSync,
      metadata: {
        is_demo: true,
        demo_session_id: sessionId,
        demo_provider: 'setu',
        demo_created_at: now,
        bank_name: 'HDFC Bank',
        region: 'India',
      },
    },
  ];
};

// Demo Accounts (mirrors bank connections for the accounts table)
export const generateDemoAccounts = (userId: string, sessionId: string): Omit<DemoAccount, 'id'>[] => {
  return [
    {
      account_name: 'Chase Business Checking',
      account_type: 'Checking',
      balance: 45230.50,
      currency_id: null,
      metadata: { is_demo: true, demo_session_id: sessionId },
    },
    {
      account_name: 'Bank of America Savings',
      account_type: 'Savings',
      balance: 125000.00,
      currency_id: null,
      metadata: { is_demo: true, demo_session_id: sessionId },
    },
    {
      account_name: 'Barclays UK Premium',
      account_type: 'Checking',
      balance: 32450.75,
      currency_id: null,
      metadata: { is_demo: true, demo_session_id: sessionId },
    },
    {
      account_name: 'GTBank Nigeria Business',
      account_type: 'Checking',
      balance: 2850000,
      currency_id: null,
      metadata: { is_demo: true, demo_session_id: sessionId },
    },
    {
      account_name: 'HDFC India Salary',
      account_type: 'Savings',
      balance: 485000,
      currency_id: null,
      metadata: { is_demo: true, demo_session_id: sessionId },
    },
  ];
};

// Transaction categories with realistic descriptions
const transactionTemplates = {
  income: [
    { category: 'Salary', descriptions: ['Monthly Salary Deposit', 'Payroll - Direct Deposit', 'Salary Payment'] },
    { category: 'Freelance', descriptions: ['Client Payment - Web Development', 'Consulting Invoice #1042', 'Design Project Payment'] },
    { category: 'Investment', descriptions: ['Dividend Payment - AAPL', 'Investment Return', 'Stock Dividend'] },
    { category: 'Business', descriptions: ['Client Invoice Payment', 'Business Revenue', 'Service Fee Received'] },
    { category: 'Refund', descriptions: ['Tax Refund', 'Product Return Refund', 'Service Refund'] },
  ],
  expense: [
    { category: 'Rent', descriptions: ['Monthly Office Rent', 'Apartment Rent Payment', 'Workspace Rental'] },
    { category: 'Utilities', descriptions: ['Electric Bill Payment', 'Water & Sewage', 'Internet Service'] },
    { category: 'Software', descriptions: ['AWS Monthly Bill', 'GitHub Team Plan', 'Figma Subscription', 'Slack Premium'] },
    { category: 'Food', descriptions: ['Uber Eats Order', 'Restaurant - Team Lunch', 'Grocery Store', 'Coffee Shop'] },
    { category: 'Transport', descriptions: ['Uber Ride', 'Monthly Transit Pass', 'Fuel Purchase', 'Parking Fee'] },
    { category: 'Entertainment', descriptions: ['Netflix Subscription', 'Spotify Premium', 'Movie Tickets', 'Gaming Subscription'] },
    { category: 'Healthcare', descriptions: ['Health Insurance Premium', 'Pharmacy Purchase', 'Doctor Visit', 'Dental Checkup'] },
    { category: 'Business', descriptions: ['Office Supplies', 'Marketing Expense', 'Legal Consultation', 'Accounting Services'] },
    { category: 'Tax', descriptions: ['Quarterly Tax Payment', 'VAT Payment', 'Property Tax', 'Self-Employment Tax'] },
    { category: 'Insurance', descriptions: ['Car Insurance', 'Life Insurance Premium', 'Business Insurance'] },
  ],
};

// Generate realistic demo transactions
export const generateDemoTransactions = (
  accountId: string, 
  sessionId: string,
  count: number = 25
): Omit<DemoTransaction, 'id'>[] => {
  const transactions: Omit<DemoTransaction, 'id'>[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 60); // Last 60 days
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const isIncome = Math.random() > 0.7; // 30% income, 70% expenses
    
    const templates = isIncome ? transactionTemplates.income : transactionTemplates.expense;
    const template = templates[Math.floor(Math.random() * templates.length)];
    const description = template.descriptions[Math.floor(Math.random() * template.descriptions.length)];
    
    // Generate realistic amounts
    let amount: number;
    if (isIncome) {
      if (template.category === 'Salary') {
        amount = 5000 + Math.random() * 10000; // $5k-$15k
      } else if (template.category === 'Freelance') {
        amount = 500 + Math.random() * 5000; // $500-$5.5k
      } else {
        amount = 100 + Math.random() * 2000;
      }
    } else {
      if (template.category === 'Rent') {
        amount = 1500 + Math.random() * 2000;
      } else if (template.category === 'Tax') {
        amount = 2000 + Math.random() * 5000;
      } else if (template.category === 'Software') {
        amount = 10 + Math.random() * 300;
      } else if (template.category === 'Food') {
        amount = 10 + Math.random() * 100;
      } else {
        amount = 20 + Math.random() * 500;
      }
    }

    transactions.push({
      account_id: accountId,
      amount: Math.round(amount * 100) / 100,
      category: template.category,
      date: date.toISOString().split('T')[0],
      description,
      type: isIncome ? 'income' : 'expense',
      metadata: {
        is_demo: true,
        demo_session_id: sessionId,
      },
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Currency formatting helpers
export const formatDemoCurrency = (amount: number, currency: string): string => {
  const formatters: Record<string, Intl.NumberFormat> = {
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
    NGN: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }),
    INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }),
  };

  return formatters[currency]?.format(amount) || `${currency} ${amount.toFixed(2)}`;
};

// Provider display names and colors
export const providerInfo: Record<string, { name: string; color: string; bgColor: string }> = {
  plaid: { name: 'Plaid', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  truelayer: { name: 'TrueLayer', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  mono: { name: 'Mono', color: 'text-green-700', bgColor: 'bg-green-100' },
  setu: { name: 'Setu', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

// Bank logo/icon colors
export const bankColors: Record<string, string> = {
  'Chase': 'bg-blue-600',
  'Bank of America': 'bg-red-600',
  'Barclays': 'bg-sky-500',
  'GTBank': 'bg-orange-500',
  'HDFC Bank': 'bg-blue-700',
};

// Calculate total net worth across demo accounts
export const calculateDemoNetWorth = (connections: DemoBankConnection[]): number => {
  // Simple sum - in production you'd convert currencies
  return connections.reduce((sum, conn) => {
    // Rough conversion to USD for demo purposes
    const rates: Record<string, number> = { USD: 1, GBP: 1.27, NGN: 0.00063, INR: 0.012 };
    const rate = rates[conn.currency] || 1;
    return sum + (conn.balance * rate);
  }, 0);
};
