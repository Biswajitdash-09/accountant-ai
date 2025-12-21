import { useDemoMode } from "./useDemoMode";
import { getDemoData, DemoAccount, DemoTransaction, DemoRevenueStream } from "@/utils/demoData";
import { useToast } from "@/components/ui/use-toast";
import { Account } from "./useAccounts";
import { Transaction } from "./useTransactions";
import { FinancialGoal } from "./useFinancialGoals";

export const useDemoAwareData = () => {
  const { isDemo } = useDemoMode();
  const { toast } = useToast();

  const showDemoSavePrompt = () => {
    toast({
      title: "Sign up to save your data",
      description: "Demo mode changes are not saved permanently. Sign up to keep your records.",
      variant: "default",
    });
  };

  const getAccountsData = (): Account[] => {
    if (isDemo) {
      const demoAccounts = getDemoData('accounts') as DemoAccount[];
      return demoAccounts.map(account => ({
        ...account,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
    return [];
  };

  const getTransactionsData = (): Transaction[] => {
    if (isDemo) {
      const demoTransactions = getDemoData('transactions') as DemoTransaction[];
      return demoTransactions.map(transaction => ({
        ...transaction,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
    return [];
  };

  const getFinancialGoalsData = (): FinancialGoal[] => {
    if (isDemo) {
      const demoGoals = getDemoData('goals') as Partial<FinancialGoal>[];
      return demoGoals.map(goal => ({
        id: goal.id || '',
        user_id: 'demo-user',
        goal_name: goal.goal_name || '',
        goal_type: goal.goal_type || 'savings',
        target_amount: goal.target_amount || 0,
        current_amount: goal.current_amount || 0,
        target_date: goal.target_date || new Date().toISOString(),
        priority: goal.priority || 'medium',
        description: goal.description || '',
        is_achieved: goal.is_achieved || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
    return [];
  };

  const getRevenueStreamsData = () => {
    if (isDemo) {
      const demoRevenue = getDemoData('revenue') as DemoRevenueStream[];
      return demoRevenue.map(stream => ({
        ...stream,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    }
    return [];
  };

  return {
    isDemo,
    showDemoSavePrompt,
    getAccountsData,
    getTransactionsData,
    getFinancialGoalsData,
    getRevenueStreamsData,
  };
};