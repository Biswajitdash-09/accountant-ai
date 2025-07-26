import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFinancialGoals, type FinancialGoal } from "@/hooks/useFinancialGoals";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Target, TrendingUp, Calendar, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'low': return 'secondary';
    case 'medium': return 'default';
    case 'high': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'default';
  }
};

const FinancialGoalsManager = () => {
  const { financialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal, isLoading } = useFinancialGoals();
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalFormState>(defaultGoalFormState);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGoalForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setGoalForm(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">
              {achievedGoals} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTargetAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
            <Progress value={Math.min(overallProgress, 100)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Goals Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>
                Track your progress towards financial objectives
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? 'Update the details of your financial goal.' : 'Define a new financial goal to track your progress.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goal_name" className="text-right">
                      Goal Name
                    </Label>
                    <Input
                      type="text"
                      id="goal_name"
                      name="goal_name"
                      value={goalForm.goal_name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goal_type" className="text-right">
                      Goal Type
                    </Label>
                    <Select value={goalForm.goal_type} onValueChange={(value) => setGoalForm(prevState => ({ ...prevState, goal_type: value as GoalFormState['goal_type'] }))} >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="debt_reduction">Debt Reduction</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense_reduction">Expense Reduction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="target_amount" className="text-right">
                      Target Amount
                    </Label>
                    <Input
                      type="number"
                      id="target_amount"
                      name="target_amount"
                      value={goalForm.target_amount}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current_amount" className="text-right">
                      Current Amount
                    </Label>
                    <Input
                      type="number"
                      id="current_amount"
                      name="current_amount"
                      value={goalForm.current_amount}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="target_date" className="text-right">
                      Target Date
                    </Label>
                    <Input
                      type="date"
                      id="target_date"
                      name="target_date"
                      value={goalForm.target_date}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">
                      Priority
                    </Label>
                    <Select value={goalForm.priority} onValueChange={(value) => setGoalForm(prevState => ({ ...prevState, priority: value as GoalFormState['priority'] }))}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={goalForm.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_achieved" className="text-right">
                      Achieved
                    </Label>
                    <div className="col-span-3">
                      <Input
                        type="checkbox"
                        id="is_achieved"
                        name="is_achieved"
                        checked={goalForm.is_achieved}
                        on
