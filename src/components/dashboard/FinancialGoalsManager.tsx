
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Target, TrendingUp, Clock } from "lucide-react";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { format } from "date-fns";

const FinancialGoalsManager = () => {
  const { financialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = useFinancialGoals();
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    goal_name: '',
    goal_type: 'savings' as 'savings' | 'investment' | 'debt_reduction' | 'revenue' | 'expense_reduction',
    target_amount: 0,
    current_amount: 0,
    target_date: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    description: '',
    is_achieved: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await updateFinancialGoal.mutateAsync({
          id: editingGoal,
          ...formData,
        });
        setEditingGoal(null);
      } else {
        await createFinancialGoal.mutateAsync(formData);
        setIsAddingGoal(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      goal_name: '',
      goal_type: 'savings',
      target_amount: 0,
      current_amount: 0,
      target_date: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      priority: 'medium',
      description: '',
      is_achieved: false,
    });
  };

  const handleEdit = (goal: any) => {
    setFormData({
      goal_name: goal.goal_name,
      goal_type: goal.goal_type,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date || format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      priority: goal.priority,
      description: goal.description || '',
      is_achieved: goal.is_achieved,
    });
    setEditingGoal(goal.id);
    setIsAddingGoal(true);
  };

  const handleDelete = async (id: string) => {
    await deleteFinancialGoal.mutateAsync(id);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return '💰';
      case 'investment': return '📈';
      case 'debt_reduction': return '💳';
      case 'revenue': return '💵';
      case 'expense_reduction': return '💸';
      default: return '🎯';
    }
  };

  if (isAddingGoal || editingGoal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</CardTitle>
          <CardDescription>
            {editingGoal ? 'Update your financial goal details' : 'Set up a new financial goal to track your progress'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal_name">Goal Name</Label>
                <Input
                  id="goal_name"
                  value={formData.goal_name}
                  onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="goal_type">Goal Type</Label>
                <Select value={formData.goal_type} onValueChange={(value: 'savings' | 'investment' | 'debt_reduction' | 'revenue' | 'expense_reduction') => setFormData({ ...formData, goal_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_amount">Target Amount</Label>
                <Input
                  id="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="current_amount">Current Amount</Label>
                <Input
                  id="current_amount"
                  type="number"
                  value={formData.current_amount}
                  onChange={(e) => setFormData({ ...formData, current_amount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingGoal(false);
                  setEditingGoal(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Financial Goals</h3>
          <p className="text-sm text-muted-foreground">
            Track and achieve your financial objectives
          </p>
        </div>
        <Button onClick={() => setIsAddingGoal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid gap-4">
        {financialGoals.map((goal) => {
          const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          
          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getGoalTypeIcon(goal.goal_type)}</span>
                    <div>
                      <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
                      <CardDescription className="capitalize">
                        {goal.goal_type.replace('_', ' ')}
                        {goal.target_date && (
                          <>
                            {' • '}
                            <Clock className="h-4 w-4 inline mr-1" />
                            {format(new Date(goal.target_date), 'MMM d, yyyy')}
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(goal.priority) as any}>
                      {goal.priority}
                    </Badge>
                    {goal.is_achieved && (
                      <Badge variant="success">Achieved</Badge>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{percentage.toFixed(1)}% complete</span>
                    <span>${(goal.target_amount - goal.current_amount).toLocaleString()} remaining</span>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {goal.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {financialGoals.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No financial goals yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first financial goal to start tracking your progress
            </p>
            <Button onClick={() => setIsAddingGoal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialGoalsManager;
