
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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalFormState>(defaultGoalFormState);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { id, ...goalData } = goalForm;

    // Validate amount fields
    const targetAmount = parseFloat(goalData.target_amount);
    const currentAmount = parseFloat(goalData.current_amount);

    if (isNaN(targetAmount) || isNaN(currentAmount)) {
      toast({
        title: "Error",
        description: "Target and current amounts must be valid numbers",
        variant: "destructive",
      });
      return;
    }

    const goal = {
      ...goalData,
      target_amount: targetAmount,
      current_amount: currentAmount,
      target_date: goalData.target_date || undefined,
    }

    try {
      if (isEditing && id) {
        await updateFinancialGoal.mutateAsync({ id, ...goal });
        toast({ description: 'Goal updated successfully.' });
      } else {
        await createFinancialGoal.mutateAsync(goal);
        toast({ description: 'Goal created successfully.' });
      }
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save goal",
        variant: "destructive",
      });
    }
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setIsEditing(true);
    setGoalForm({
      id: goal.id,
      goal_name: goal.goal_name,
      goal_type: goal.goal_type,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      target_date: goal.target_date || '',
      priority: goal.priority,
      description: goal.description || '',
      is_achieved: goal.is_achieved,
      currency_id: goal.currency_id,
    });
    setIsDialogOpen(true);
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

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setGoalForm(defaultGoalFormState);
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
            <FinancialGoalForm
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              goalForm={goalForm}
              setGoalForm={setGoalForm}
              isEditing={isEditing}
              onSubmit={handleSubmit}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </FinancialGoalForm>
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
    </div>
  );
};

export default FinancialGoalsManager;
