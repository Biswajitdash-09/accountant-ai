
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBudgets } from "@/hooks/useBudgets";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { BudgetOverviewCards } from "./budget/BudgetOverviewCards";
import { BudgetFormDialog } from "./budget/BudgetFormDialog";
import { BudgetCard } from "./budget/BudgetCard";
import { BudgetManagementCard } from "./budget/BudgetManagementCard";

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
      overallProgress: totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0,
      budgetsCount: budgets.length
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
      <BudgetOverviewCards budgetSummary={budgetSummary} />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Budget Management</CardTitle>
              <CardDescription>
                Plan and track your spending across different categories
              </CardDescription>
            </div>
            <BudgetFormDialog
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              formState={formState}
              editingBudget={editingBudget}
              onInputChange={handleInputChange}
              onSwitchChange={handleSwitchChange}
              onSubmit={handleSubmit}
            >
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </BudgetFormDialog>
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
                  {budgets.map((budget) => (
                    <BudgetCard
                      key={budget.id}
                      budget={budget}
                      formatCurrency={formatCurrency}
                    />
                  ))}
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
                    <BudgetManagementCard
                      key={budget.id}
                      budget={budget}
                      onEdit={handleEditBudget}
                      onDelete={handleDeleteBudget}
                    />
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
