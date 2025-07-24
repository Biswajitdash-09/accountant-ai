
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Target, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import MetricCard from "./MetricCard";

const FinancialGoalsManager = () => {
  const { financialGoals, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal, isLoading } = useFinancialGoals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [formData, setFormData] = useState({
    goal_name: '',
    goal_type: 'savings',
    target_amount: 0,
    current_amount: 0,
    target_date: '',
    priority: 'medium',
    description: '',
  });

  const goalsAnalytics = useMemo(() => {
    if (!financialGoals.length) return null;

    const activeGoals = financialGoals.filter(g => !g.is_achieved);
    const completedGoals = financialGoals.filter(g => g.is_achieved);
    const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.current_amount, 0);
    const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

    const urgentGoals = activeGoals.filter(g => {
      if (!g.target_date) return false;
      const daysUntilDeadline = Math.ceil((new Date(g.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline <= 30 && daysUntilDeadline > 0;
    });

    return {
      totalGoals: financialGoals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      overallProgress,
      urgentGoals: urgentGoals.length,
      totalTargetAmount,
      totalCurrentAmount,
    };
  }, [financialGoals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await updateFinancialGoal.mutateAsync({ id: editingGoal.id, ...formData });
      } else {
        await createFinancialGoal.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      setEditingGoal(null);
      setFormData({
        goal_name: '',
        goal_type: 'savings',
        target_amount: 0,
        current_amount: 0,
        target_date: '',
        priority: 'medium',
        description: '',
      });
    } catch (error) {
      console.error('Goal operation error:', error);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
    setFormData({
      goal_name: goal.goal_name,
      goal_type: goal.goal_type,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      target_date: goal.target_date || '',
      priority: goal.priority,
      description: goal.description || '',
    });
    setIsDialogOpen(true);
  };

  const toggleGoalCompletion = async (goal: any) => {
    await updateFinancialGoal.mutateAsync({
      id: goal.id,
      is_achieved: !goal.is_achieved,
      current_amount: goal.is_achieved ? goal.current_amount : goal.target_amount,
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading financial goals...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {goalsAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Goals"
            value={goalsAnalytics.totalGoals.toString()}
            icon={<Target className="h-4 w-4" />}
            description={`${goalsAnalytics.activeGoals} active, ${goalsAnalytics.completedGoals} completed`}
          />
          <MetricCard
            title="Overall Progress"
            value={`${goalsAnalytics.overallProgress.toFixed(1)}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{
              value: goalsAnalytics.overallProgress,
              positive: goalsAnalytics.overallProgress > 50,
            }}
            description="Across all active goals"
          />
          <MetricCard
            title="Total Target"
            value={`$${goalsAnalytics.totalTargetAmount.toLocaleString()}`}
            icon={<Target className="h-4 w-4" />}
            description="Combined target amount"
          />
          <MetricCard
            title="Urgent Goals"
            value={goalsAnalytics.urgentGoals.toString()}
            icon={<AlertCircle className="h-4 w-4" />}
            description="Due within 30 days"
          />
        </div>
      )}

      {/* Goals Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Financial Goals</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Select value={formData.goal_type} onValueChange={(value) => setFormData({ ...formData, goal_type: value })}>
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
                      <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
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
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingGoal ? 'Update Goal' : 'Create Goal'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialGoals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const isOverdue = goal.target_date && new Date(goal.target_date) < new Date() && !goal.is_achieved;
              const daysUntilDeadline = goal.target_date ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
              
              return (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{goal.goal_name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{goal.goal_type.replace('_', ' ')}</Badge>
                        <Badge variant={goal.priority === 'critical' ? 'destructive' : goal.priority === 'high' ? 'default' : 'secondary'}>
                          {goal.priority}
                        </Badge>
                        {goal.is_achieved && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Achieved
                          </Badge>
                        )}
                        {isOverdue && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => toggleGoalCompletion(goal)}>
                        {goal.is_achieved ? 'Mark Incomplete' : 'Mark Complete'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteFinancialGoal.mutate(goal.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current: ${goal.current_amount.toLocaleString()}</span>
                      <span>Target: ${goal.target_amount.toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{progress.toFixed(1)}% complete</span>
                      {goal.target_date && (
                        <span className={isOverdue ? 'text-red-600' : daysUntilDeadline && daysUntilDeadline <= 30 ? 'text-orange-600' : ''}>
                          {isOverdue ? 'Overdue' : daysUntilDeadline ? `${daysUntilDeadline} days left` : format(new Date(goal.target_date), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mt-2">{goal.description}</p>
                  )}
                </div>
              );
            })}
            {financialGoals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No financial goals set yet.</p>
                <p className="text-sm">Create your first goal to start tracking your financial progress.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialGoalsManager;
