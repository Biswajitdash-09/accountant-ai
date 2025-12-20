import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Edit2, 
  Trash2,
  AlertCircle
} from "lucide-react";
import FinancialGoalForm from "./goals/FinancialGoalForm";

const FinancialGoalsManager = () => {
  const { financialGoals, isLoading, createFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = useFinancialGoals();
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);

  const handleSubmitGoal = async (goalData: any) => {
    setIsSubmitting(true);

    try {
      if (editingGoal) {
        await updateFinancialGoal.mutateAsync({ id: editingGoal.id, ...goalData });
        toast({ description: 'Goal updated successfully.' });
      } else {
        await createFinancialGoal.mutateAsync(goalData);
        toast({ description: 'Goal created successfully.' });
      }
      setIsFormOpen(false);
      setEditingGoal(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Operation failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteFinancialGoal.mutateAsync(goalId);
      toast({ description: 'Goal deleted successfully.' });
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'savings': return <Target className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'debt_reduction': return <AlertCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 flex-wrap">
                <Target className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Financial Goals</span>
              </CardTitle>
              <CardDescription className="break-words">
                Track your progress towards financial objectives
              </CardDescription>
            </div>
            <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {financialGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Financial Goals</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first financial goal to track your progress.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {financialGoals.map((goal: any) => {
                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                const isAchieved = progress >= 100 || goal.is_achieved;
                
                 return (
                   <Card key={goal.id} className={`transition-all hover:shadow-md ${isAchieved ? 'bg-success/5 border-success/20 dark:bg-success/10 dark:border-success/30' : ''}`}>
                     <CardContent className="p-4 overflow-hidden">
                      <div className="space-y-3">
                        {/* Header - goal name and actions */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getGoalTypeIcon(goal.goal_type)}
                            <h3 className="font-semibold break-words">{goal.goal_name}</h3>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGoal(goal)}
                              className="min-h-[44px] min-w-[44px]"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="min-h-[44px] min-w-[44px]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Badges row */}
                         <div className="flex items-center gap-2 flex-wrap">
                           <Badge 
                             variant={getPriorityVariant(goal.priority)}
                             className="text-xs"
                           >
                             {goal.priority}
                           </Badge>
                           {isAchieved && (
                             <Badge variant="default" className="bg-success text-success-foreground text-xs">
                               Achieved!
                             </Badge>
                           )}
                         </div>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-muted-foreground break-words line-clamp-2 mb-3">{goal.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                          <span>Progress</span>
                          <span className="font-medium break-words">
                            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-muted-foreground">
                          <span>{Math.round(progress)}% complete</span>
                          {goal.target_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span className="break-words">{new Date(goal.target_date).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <FinancialGoalForm
              onSubmit={handleSubmitGoal}
              onCancel={() => { setIsFormOpen(false); setEditingGoal(null); }}
              isSubmitting={isSubmitting}
              initialData={editingGoal || undefined}
              mode={editingGoal ? 'edit' : 'create'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialGoalsManager;
