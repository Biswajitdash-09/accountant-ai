
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { FinancialGoal } from "@/hooks/useFinancialGoals";

interface FinancialGoalCardProps {
  goal: FinancialGoal;
  formatCurrency: (amount: number) => string;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (goalId: string) => void;
}

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'low': return 'secondary';
    case 'medium': return 'default';
    case 'high': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'default';
  }
};

export const FinancialGoalCard = ({ goal, formatCurrency, onEdit, onDelete }: FinancialGoalCardProps) => {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{goal.goal_type.replace('_', ' ')}</Badge>
              <Badge variant={getPriorityVariant(goal.priority)}>{goal.priority}</Badge>
              {goal.is_achieved && <Badge variant="default">Achieved</Badge>}
            </div>
            {goal.description && (
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(goal)}
              className="h-8 w-8 p-0 hover:bg-muted dark:hover:bg-muted"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(goal.id)}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/10 dark:hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} />
          <div className="flex justify-between text-sm">
            <span>Current: {formatCurrency(goal.current_amount)}</span>
            <span>Target: {formatCurrency(goal.target_amount)}</span>
          </div>
          {goal.target_date && (
            <div className="text-sm text-muted-foreground">
              Target Date: {new Date(goal.target_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
