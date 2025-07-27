
import { FinancialGoal } from "@/hooks/useFinancialGoals";

export interface DemoTransaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  account_id: string;
  currency_id: string;
}

export interface DemoAccount {
  id: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency_id: string;
}

export interface DemoRevenueStream {
  id: string;
  stream_name: string;
  stream_type: 'salary' | 'freelance' | 'investment' | 'business';
  target_amount: number;
  actual_amount: number;
  period_start: string;
  period_end: string;
  is_active: boolean;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-acc-1',
    account_name: 'Main Checking',
    account_type: 'checking',
    balance: 12500.00,
    currency_id: 'usd'
  },
  {
    id: 'demo-acc-2',
    account_name: 'Savings Account',
    account_type: 'savings',
    balance: 25000.00,
    currency_id: 'usd'
  },
  {
    id: 'demo-acc-3',
    account_name: 'Business Credit',
    account_type: 'credit',
    balance: -2500.00,
    currency_id: 'usd'
  }
];

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  {
    id: 'demo-txn-1',
    date: '2024-01-15',
    amount: 5000.00,
    category: 'Salary',
    description: 'Monthly salary payment',
    type: 'income',
    account_id: 'demo-acc-1',
    currency_id: 'usd'
  },
  {
    id: 'demo-txn-2',
    date: '2024-01-16',
    amount: -1200.00,
    category: 'Rent',
    description: 'Monthly rent payment',
    type: 'expense',
    account_id: 'demo-acc-1',
    currency_id: 'usd'
  },
  {
    id: 'demo-txn-3',
    date: '2024-01-17',
    amount: -45.50,
    category: 'Groceries',
    description: 'Weekly grocery shopping',
    type: 'expense',
    account_id: 'demo-acc-1',
    currency_id: 'usd'
  },
  {
    id: 'demo-txn-4',
    date: '2024-01-18',
    amount: 1500.00,
    category: 'Freelance',
    description: 'Website development project',
    type: 'income',
    account_id: 'demo-acc-1',
    currency_id: 'usd'
  },
  {
    id: 'demo-txn-5',
    date: '2024-01-19',
    amount: -85.00,
    category: 'Utilities',
    description: 'Electric bill payment',
    type: 'expense',
    account_id: 'demo-acc-1',
    currency_id: 'usd'
  }
];

export const DEMO_FINANCIAL_GOALS: Partial<FinancialGoal>[] = [
  {
    id: 'demo-goal-1',
    goal_name: 'Emergency Fund',
    goal_type: 'savings',
    target_amount: 30000.00,
    current_amount: 25000.00,
    target_date: '2024-12-31',
    priority: 'high',
    description: '6 months of expenses for emergency fund',
    is_achieved: false
  },
  {
    id: 'demo-goal-2',
    goal_name: 'New Laptop',
    goal_type: 'savings',
    target_amount: 2500.00,
    current_amount: 1800.00,
    target_date: '2024-03-31',
    priority: 'medium',
    description: 'MacBook Pro for work',
    is_achieved: false
  },
  {
    id: 'demo-goal-3',
    goal_name: 'Vacation Fund',
    goal_type: 'savings',
    target_amount: 5000.00,
    current_amount: 3200.00,
    target_date: '2024-06-30',
    priority: 'low',
    description: 'Summer vacation to Europe',
    is_achieved: false
  }
];

export const DEMO_REVENUE_STREAMS: DemoRevenueStream[] = [
  {
    id: 'demo-revenue-1',
    stream_name: 'Full-time Salary',
    stream_type: 'salary',
    target_amount: 5000.00,
    actual_amount: 5000.00,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    is_active: true
  },
  {
    id: 'demo-revenue-2',
    stream_name: 'Freelance Projects',
    stream_type: 'freelance',
    target_amount: 2000.00,
    actual_amount: 1500.00,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    is_active: true
  },
  {
    id: 'demo-revenue-3',
    stream_name: 'Investment Returns',
    stream_type: 'investment',
    target_amount: 500.00,
    actual_amount: 340.00,
    period_start: '2024-01-01',
    period_end: '2024-01-31',
    is_active: true
  }
];

export const seedDemoData = () => {
  // Store demo data in localStorage
  localStorage.setItem('demoAccounts', JSON.stringify(DEMO_ACCOUNTS));
  localStorage.setItem('demoTransactions', JSON.stringify(DEMO_TRANSACTIONS));
  localStorage.setItem('demoFinancialGoals', JSON.stringify(DEMO_FINANCIAL_GOALS));
  localStorage.setItem('demoRevenueStreams', JSON.stringify(DEMO_REVENUE_STREAMS));
  
  console.log('Demo data seeded successfully');
};

export const getDemoData = (type: 'accounts' | 'transactions' | 'goals' | 'revenue') => {
  const isGuest = localStorage.getItem('isGuest') === 'true';
  if (!isGuest) return [];
  
  switch (type) {
    case 'accounts':
      return JSON.parse(localStorage.getItem('demoAccounts') || '[]');
    case 'transactions':
      return JSON.parse(localStorage.getItem('demoTransactions') || '[]');
    case 'goals':
      return JSON.parse(localStorage.getItem('demoFinancialGoals') || '[]');
    case 'revenue':
      return JSON.parse(localStorage.getItem('demoRevenueStreams') || '[]');
    default:
      return [];
  }
};

export const clearDemoData = () => {
  localStorage.removeItem('demoAccounts');
  localStorage.removeItem('demoTransactions');
  localStorage.removeItem('demoFinancialGoals');
  localStorage.removeItem('demoRevenueStreams');
  localStorage.removeItem('isGuest');
};
