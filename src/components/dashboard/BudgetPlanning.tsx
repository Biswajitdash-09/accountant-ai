
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useBudgets } from "@/hooks/useBudgets";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Target, TrendingUp, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BudgetFormState {
  name: string;
  budget_period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  total_budget: string;
  start_date: string;
  end_date: string;
  categories: any[];
  is_active: boolean;
}

const initialFormState: BudgetFormState = {
  name: "",
  budget_period: 'monthly',
  total_budget: "",
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
  categories: [],
  is_active: true,
};

const BudgetPlanning = () => {
  const { budgets, createBudget, updateBudget, deleteBudget, isLoading } = useBudgets();
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formState, setFormState] = useState<BudgetFormState>(initialFormState);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormState(prevState => ({
      ...prevState,
      is_active: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, budget_period, total_budget, start_date, end_date, categories, is_active } = formState;

    if (!name || !total_budget || !start_date || !end_date) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const budgetData = {
      name,
      budget_period,
      total_budget: parseFloat(total_budget),
      actual_spent: 0,
      start_date,
      end_date,
      categories,
      is_active,
    };

    if (editingBudget) {
      await updateBudget.mutateAsync({ id: editingBudget.id, ...budgetData });
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    } else {
      await createBudget.mutateAsync(budgetData);
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
    }

    setFormState(initialFormState);
    setEditingBudget(null);
    setIsDialogOpen(false);
  };

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget);
    setFormState({
      name: budget.name,
      budget_period: budget.budget_period,
      total_budget: budget.total_budget.toString(),
      start_date: budget.start_date,
      end_date: budget.end_date,
      categories: budget.categories || [],
      is_active: budget.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget.mutateAsync(id);
    toast({
      title: "Success",
      description: "Budget deleted successfully",
    });
  };

  // Calculate budget summary with proper currency formatting
  const budgetSummary = useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, budget) => sum + Number(budget.total_budget), 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + Number(budget.actual_spent), 0);
    const remaining = totalBudgeted - totalSpent;

    return {
      totalBudgeted,
      totalSpent,
      remaining,
      formattedTotalBudgeted: formatCurrency(totalBudgeted),
      formattedTotalSpent: formatCurrency(totalSpent),
      formattedRemaining: formatCurrency(remaining),
      overallProgress: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
    };
  }, [budgets, formatCurrency]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetSummary.formattedTotalBudgeted}</div>
            <p className="text-xs text-muted-foreground">
              Across {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetSummary.formattedTotalSpent}</div>
            <Progress value={budgetSummary.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetSummary.formattedRemaining}</div>
            <p className="text-xs text-muted-foreground">
              {budgetSummary.remaining >= 0 ? 'Under budget' : 'Over budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Plan and track your spending across different categories
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingBudget ? "Edit Budget" : "Create Budget"}</DialogTitle>
                  <DialogDescription>
                    {editingBudget ? "Update your budget details here." : "Enter the details for your new budget."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="total_budget" className="text-right">
                      Total Budget
                    </Label>
                    <Input
                      type="number"
                      id="total_budget"
                      name="total_budget"
                      value={formState.total_budget}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start_date" className="text-right">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formState.start_date}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="end_date" className="text-right">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formState.end_date}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_active" className="text-right">
                      Active
                    </Label>
                    <Switch
                      id="is_active"
                      checked={formState.is_active}
                      onCheckedChange={handleSwitchChange}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={handleSubmit}>
                    {editingBudget ? "Update Budget" : "Create Budget"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="manage">Manage Budgets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {budgets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No budgets created yet</p>
                  <Button className="mt-2" onClick={() => setIsDialogOpen(true)}>
                    Create Your First Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const spent = Number(budget.actual_spent);
                    const total = Number(budget.total_budget);
                    const progress = total > 0 ? (spent / total) * 100 : 0;
                    const remaining = total - spent;

                    return (
                      <Card key={budget.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold">{budget.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {budget.start_date} to {budget.end_date}
                              </p>
                            </div>
                            <Badge variant={budget.is_active ? "default" : "secondary"}>
                              {budget.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Spent: {formatCurrency(spent)}</span>
                              <span>Budget: {formatCurrency(total)}</span>
                            </div>
                            <Progress value={Math.min(progress, 100)} className="h-2" />
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{progress.toFixed(1)}% used</span>
                              <span className={remaining < 0 ? "text-red-600" : "text-green-600"}>
                                Remaining: {formatCurrency(remaining)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {budgets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No budgets created yet</p>
                  <Button className="mt-2" onClick={() => setIsDialogOpen(true)}>
                    Create Your First Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => (
                    <Card key={budget.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">{budget.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {budget.start_date} to {budget.end_date}
                            </p>
                          </div>
                          <Badge variant={budget.is_active ? "default" : "secondary"}>
                            {budget.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBudget(budget)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPlanning;
