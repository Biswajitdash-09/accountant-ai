
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialGoals, type FinancialGoal } from "@/hooks/useFinancialGoals";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Target } from "lucide-react";
import { FinancialGoalsSummaryCards } from "./goals/FinancialGoalsSummaryCards";
import FinancialGoalForm from "./goals/FinancialGoalForm";
import { FinancialGoalCard } from "./goals/FinancialGoalCard";

interface GoalFormState {
  id?: string;
  goal_name: string;
  goal_type: 'savings' | 'investment' | 'debt_reduction' | 'revenue' | 'expense_reduction';
  target_amount: string;
  current_amount: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  is_achieved: boolean;
  currency_id?: string;
}

const defaultGoalFormState: GoalFormState = {
  goal_name: '',
  goal_type: 'savings',
  target_amount: '',
  current_amount: '',
  target_date: '',
  priority: 'medium',
  description: '',
  is_achieved: false,
};

const FinancialGoalsManager = () => {
  const { financialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal, isLoading } = useFinancialGoals();
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGoal = async (goalData: any) => {
    setIsSubmitting(true);
    try {
      await createFinancialGoal.mutateAsync(goalData);
      setIsFormOpen(false);
      toast({ description: 'Goal created successfully.' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    // This would open an edit form - for now we'll just show a toast
    toast({ description: 'Edit functionality will be implemented soon.' });
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteFinancialGoal.mutateAsync(goalId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const totalGoals = financialGoals.length;
  const achievedGoals = financialGoals.filter(goal => goal.is_achieved).length;
  const totalTargetAmount = financialGoals.reduce((sum, goal) => sum + Number(goal.target_amount), 0);
  const totalCurrentAmount = financialGoals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      <FinancialGoalsSummaryCards
        totalGoals={totalGoals}
        achievedGoals={achievedGoals}
        totalTargetAmount={totalTargetAmount}
        totalCurrentAmount={totalCurrentAmount}
        overallProgress={overallProgress}
        formatCurrency={formatCurrency}
      />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>
                Track your progress towards financial objectives
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {financialGoals.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Target className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p>No financial goals yet. Create your first goal to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {financialGoals.map((goal) => (
                <FinancialGoalCard
                  key={goal.id}
                  goal={goal}
                  formatCurrency={formatCurrency}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <FinancialGoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setIsFormOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoalsManager;
