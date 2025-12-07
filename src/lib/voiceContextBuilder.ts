import { supabase } from '@/integrations/supabase/client';

export interface FinancialContext {
  accountSummary: {
    totalBalance: number;
    accountCount: number;
    accounts: Array<{ name: string; type: string; balance: number }>;
  };
  recentTransactions: {
    count: number;
    totalIncome: number;
    totalExpenses: number;
    topCategories: Array<{ category: string; amount: number }>;
  };
  budgetStatus: {
    activeBudgets: number;
    overBudgetCount: number;
    budgets: Array<{ name: string; spent: number; limit: number; percentage: number }>;
  };
  upcomingDeadlines: Array<{ title: string; date: string; type: string }>;
  financialGoals: Array<{ name: string; current: number; target: number; percentage: number }>;
}

// Build context for personalized voice agent responses
export const buildFinancialContext = async (userId: string): Promise<FinancialContext | null> => {
  try {
    // Fetch accounts
    const { data: accounts } = await supabase
      .from('accounts')
      .select('account_name, account_type, balance')
      .eq('user_id', userId);

    // Fetch recent transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('type, amount, category')
      .eq('user_id', userId)
      .gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0]);

    // Fetch active budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('name, total_budget, actual_spent')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Fetch upcoming deadlines (next 30 days)
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    
    const { data: deadlines } = await supabase
      .from('deadlines')
      .select('title, deadline_date, deadline_type')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .lte('deadline_date', thirtyDaysAhead.toISOString().split('T')[0])
      .order('deadline_date', { ascending: true })
      .limit(5);

    // Fetch financial goals
    const { data: goals } = await supabase
      .from('financial_goals')
      .select('goal_name, current_amount, target_amount')
      .eq('user_id', userId)
      .eq('is_achieved', false)
      .limit(5);

    // Calculate account summary
    const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
    const accountSummary = {
      totalBalance,
      accountCount: accounts?.length || 0,
      accounts: accounts?.map(a => ({
        name: a.account_name,
        type: a.account_type,
        balance: a.balance || 0
      })) || []
    };

    // Calculate transaction summary
    const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
    const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const categoryMap = new Map<string, number>();
    transactions?.filter(t => t.type === 'expense').forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    const recentTransactions = {
      count: transactions?.length || 0,
      totalIncome,
      totalExpenses,
      topCategories
    };

    // Calculate budget status
    const budgetStatus = {
      activeBudgets: budgets?.length || 0,
      overBudgetCount: budgets?.filter(b => (b.actual_spent || 0) > b.total_budget).length || 0,
      budgets: budgets?.map(b => ({
        name: b.name,
        spent: b.actual_spent || 0,
        limit: b.total_budget,
        percentage: Math.round(((b.actual_spent || 0) / b.total_budget) * 100)
      })) || []
    };

    // Format deadlines
    const upcomingDeadlines = deadlines?.map(d => ({
      title: d.title,
      date: d.deadline_date,
      type: d.deadline_type
    })) || [];

    // Format goals
    const financialGoals = goals?.map(g => ({
      name: g.goal_name,
      current: g.current_amount || 0,
      target: g.target_amount,
      percentage: Math.round(((g.current_amount || 0) / g.target_amount) * 100)
    })) || [];

    return {
      accountSummary,
      recentTransactions,
      budgetStatus,
      upcomingDeadlines,
      financialGoals
    };
  } catch (error) {
    console.error('Error building financial context:', error);
    return null;
  }
};

// Generate context string for AI system prompt
export const generateContextPrompt = (context: FinancialContext): string => {
  const lines: string[] = [];

  // Account info
  if (context.accountSummary.accountCount > 0) {
    lines.push(`User has ${context.accountSummary.accountCount} accounts with total balance of ${context.accountSummary.totalBalance.toFixed(2)}.`);
  }

  // Recent activity
  if (context.recentTransactions.count > 0) {
    lines.push(`In the last 30 days: ${context.recentTransactions.totalIncome.toFixed(2)} income, ${context.recentTransactions.totalExpenses.toFixed(2)} expenses.`);
    if (context.recentTransactions.topCategories.length > 0) {
      const topCats = context.recentTransactions.topCategories.slice(0, 3).map(c => c.category).join(', ');
      lines.push(`Top spending categories: ${topCats}.`);
    }
  }

  // Budget alerts
  if (context.budgetStatus.overBudgetCount > 0) {
    lines.push(`⚠️ ${context.budgetStatus.overBudgetCount} budget(s) are over limit.`);
  }

  // Upcoming deadlines
  if (context.upcomingDeadlines.length > 0) {
    const nextDeadline = context.upcomingDeadlines[0];
    lines.push(`Next deadline: ${nextDeadline.title} on ${nextDeadline.date}.`);
  }

  // Goal progress
  const activeGoals = context.financialGoals.filter(g => g.percentage < 100);
  if (activeGoals.length > 0) {
    const nearestGoal = activeGoals.sort((a, b) => b.percentage - a.percentage)[0];
    lines.push(`Closest goal: ${nearestGoal.name} at ${nearestGoal.percentage}% complete.`);
  }

  return lines.join(' ');
};
