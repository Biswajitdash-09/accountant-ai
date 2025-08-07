import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useDemoMode } from "@/hooks/useDemoMode";
import { getDemoData } from "@/utils/demoData";
import { useToast } from "@/components/ui/use-toast";
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
  const { isDemo } = useDemoMode();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use demo data if in demo mode
  const displayGoals = isDemo ? getDemoData('goals') : financialGoals;

  const handleCreateGoal = async (goalData: any) => {
    setIsSubmitting(true);
    
    console.log('Financial goal creation started', { goalData });
    
    if (isDemo) {
      // Simulate success for demo mode
      setTimeout(() => {
        toast({ 
          title: "Demo Mode",
          description: 'Goal created successfully! (Demo data - not saved)' 
        });
        setIsFormOpen(false);
        setIsSubmitting(false);
      }, 1000);
      return;
    }
    
    try {
      console.log('Creating financial goal with data:', goalData);
      await createFinancialGoal.mutateAsync(goalData);
      console.log('Financial goal created successfully');
      setIsFormOpen(false);
      toast({ description: 'Goal created successfully.' });
    } catch (error: any) {
      console.error('Error creating financial goal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = (goal: any) => {
    if (isDemo) {
      toast({ 
        title: "Demo Mode",
        description: 'Edit functionality is simulated in demo mode.',
        variant: "default"
      });
      return;
    }
    
    // This would open an edit form - for now we'll just show a toast
    toast({ description: 'Edit functionality will be implemented soon.' });
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (isDemo) {
      toast({ 
        title: "Demo Mode",
        description: 'Delete functionality is simulated in demo mode.',
        variant: "default"
      });
      return;
    }
    
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

  if (isLoading && !isDemo) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Financial Goals
                {isDemo && (
                  <Badge variant="secondary" className="ml-2">
                    Demo Data
                  </Badge>
                )}
              </CardTitle>
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
          {displayGoals.length === 0 ? (
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
              {displayGoals.map((goal: any) => {
                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                const isAchieved = progress >= 100 || goal.is_achieved;
                
                return (
                  <Card key={goal.id} className={`transition-all hover:shadow-md ${isAchieved ? 'bg-green-50 border-green-200' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getGoalTypeIcon(goal.goal_type)}
                            <h3 className="font-semibold">{goal.goal_name}</h3>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(goal.priority)} text-white border-none`}
                          >
                            {goal.priority}
                          </Badge>
                          {isAchieved && (
                            <Badge variant="default" className="bg-green-500">
                              Achieved!
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                          </span>
                        </div>
                        <Progress value={Math.min(progress, 100)} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(progress)}% complete</span>
                          {goal.target_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(goal.target_date).toLocaleDateString()}
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
