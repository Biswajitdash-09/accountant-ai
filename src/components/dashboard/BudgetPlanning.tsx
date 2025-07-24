
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";

const BudgetPlanning = () => {
  const { budgets, createBudget, updateBudget, deleteBudget } = useBudgets();
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    budget_period: 'monthly' as 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    total_budget: 0,
    actual_spent: 0,
    categories: [] as any[],
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await updateBudget.mutateAsync({
          id: editingBudget,
          ...formData,
        });
        setEditingBudget(null);
      } else {
        await createBudget.mutateAsync(formData);
        setIsAddingBudget(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      budget_period: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      total_budget: 0,
      actual_spent: 0,
      categories: [],
      is_active: true,
    });
  };

  const handleEdit = (budget: any) => {
    setFormData({
      name: budget.name,
      budget_period: budget.budget_period,
      start_date: budget.start_date,
      end_date: budget.end_date,
      total_budget: budget.total_budget,
      actual_spent: budget.actual_spent,
      categories: budget.categories,
      is_active: budget.is_active,
    });
    setEditingBudget(budget.id);
    setIsAddingBudget(true);
  };

  const handleDelete = async (id: string) => {
    await deleteBudget.mutateAsync(id);
  };

  const getBudgetStatus = (budget: any) => {
    const percentage = (budget.actual_spent / budget.total_budget) * 100;
    if (percentage >= 90) return { color: 'destructive', text: 'Over Budget' };
    if (percentage >= 75) return { color: 'warning', text: 'Near Limit' };
    return { color: 'success', text: 'On Track' };
  };

  if (isAddingBudget || editingBudget) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
          <CardDescription>
            {editingBudget ? 'Update your budget details' : 'Set up a new budget to track your spending'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget_period">Budget Period</Label>
                <Select value={formData.budget_period} onValueChange={(value: 'weekly' | 'monthly' | 'quarterly' | 'yearly') => setFormData({ ...formData, budget_period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="total_budget">Total Budget</Label>
              <Input
                id="total_budget"
                type="number"
                value={formData.total_budget}
                onChange={(e) => setFormData({ ...formData, total_budget: Number(e.target.value) })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingBudget ? 'Update Budget' : 'Create Budget'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingBudget(false);
                  setEditingBudget(null);
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
          <h3 className="text-lg font-semibold">Budget Planning</h3>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your budgets effectively
          </p>
        </div>
        <Button onClick={() => setIsAddingBudget(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

      <div className="grid gap-4">
        {budgets.map((budget) => {
          const status = getBudgetStatus(budget);
          const percentage = Math.min((budget.actual_spent / budget.total_budget) * 100, 100);
          
          return (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <CardDescription>
                      {budget.budget_period} • {format(new Date(budget.start_date), 'MMM d')} - {format(new Date(budget.end_date), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.color as any}>{status.text}</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
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
                    <span className="text-sm font-medium">Budget Progress</span>
                    <span className="text-sm text-muted-foreground">
                      ${budget.actual_spent.toLocaleString()} / ${budget.total_budget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{percentage.toFixed(1)}% spent</span>
                    <span>${(budget.total_budget - budget.actual_spent).toLocaleString()} remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending
            </p>
            <Button onClick={() => setIsAddingBudget(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetPlanning;
