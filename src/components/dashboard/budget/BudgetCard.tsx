
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Budget {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  actual_spent: number;
  total_budget: number;
}

interface BudgetCardProps {
  budget: Budget;
  formatCurrency: (amount: number) => string;
}

export const BudgetCard = ({ budget, formatCurrency }: BudgetCardProps) => {
  const spent = Number(budget.actual_spent);
  const total = Number(budget.total_budget);
  const progress = total > 0 ? (spent / total) * 100 : 0;
  const remaining = total - spent;

  return (
    <Card>
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
};
