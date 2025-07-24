
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Target, TrendingUp, AlertCircle } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useTransactions } from "@/hooks/useTransactions";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import MetricCard from "./MetricCard";

const BudgetPlanning = () => {
  const { budgets, createBudget, updateBudget, deleteBudget, isLoading } = useBudgets();
  const { transactions } = useTransactions();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    budget_period: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    total_budget: 0,
    categories: [],
  });

  const budgetAnalytics = useMemo(() => {
    if (!budgets.length || !transactions.length) return null;

    const activeBudgets = budgets.filter(b => b.is_active);
    const totalBudgeted = activeBudgets.reduce((sum, b) => sum + b.total_budget, 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + b.actual_spent, 0);
    const remainingBudget = totalBudgeted - totalSpent;
    const utilizationRate = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      totalBudgeted,
      totalSpent,
      remainingBudget,
      utilizationRate,
      activeBudgets: activeBudgets.length,
    };
  }, [budgets, transactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBudget) {
        await updateBudget.mutateAsync({ id: editingBudget.id, ...formData });
      } else {
        await createBudget.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      setEditingBudget(null);
      setFormData({
        name: '',
        budget_period: 'monthly',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        total_budget: 0,
        categories: [],
      });
    } catch (error) {
      console.error('Budget operation error:', error);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      budget_period: budget.budget_period,
      start_date: budget.start_date,
      end_date: budget.end_date,
      total_budget: budget.total_budget,
      categories: budget.categories,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading budget data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {budgetAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Budget"
            value={`$${budgetAnalytics.totalBudgeted.toLocaleString()}`}
            icon={<Target className="h-4 w-4" />}
            description="All active budgets"
          />
          <MetricCard
            title="Total Spent"
            value={`$${budgetAnalytics.totalSpent.toLocaleString()}`}
            icon={<TrendingUp className="h-4 w-4" />}
            description="Actual spending"
          />
          <MetricCard
            title="Remaining"
            value={`$${budgetAnalytics.remainingBudget.toLocaleString()}`}
            icon={<AlertCircle className="h-4 w-4" />}
            trend={{
              value: budgetAnalytics.utilizationRate,
              positive: budgetAnalytics.utilizationRate < 80,
            }}
            description="Budget remaining"
          />
          <MetricCard
            title="Utilization"
            value={`${budgetAnalytics.utilizationRate.toFixed(1)}%`}
            icon={<Target className="h-4 w-4" />}
            description="Budget utilization rate"
          />
        </div>
      )}

      {/* Budget Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Budget Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Select value={formData.budget_period} onValueChange={(value) => setFormData({ ...formData, budget_period: value })}>
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
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingBudget ? 'Update Budget' : 'Create Budget'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const progress = budget.total_budget > 0 ? (budget.actual_spent / budget.total_budget) * 100 : 0;
              const isOverBudget = progress > 100;
              
              return (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{budget.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{budget.budget_period}</Badge>
                        <Badge variant={budget.is_active ? "default" : "secondary"}>
                          {budget.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(budget)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteBudget.mutate(budget.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spent: ${budget.actual_spent.toLocaleString()}</span>
                      <span>Budget: ${budget.total_budget.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{format(new Date(budget.start_date), 'MMM dd, yyyy')}</span>
                      <span className={isOverBudget ? 'text-red-600' : ''}>
                        {progress.toFixed(1)}% used
                      </span>
                      <span>{format(new Date(budget.end_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {budgets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No budgets created yet.</p>
                <p className="text-sm">Create your first budget to start tracking your spending.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPlanning;
