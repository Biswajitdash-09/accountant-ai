
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Budget {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  actual_spent: number;
  total_budget: number;
}

interface BudgetManagementCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetManagementCard = ({ budget, onEdit, onDelete }: BudgetManagementCardProps) => {
  return (
    <Card className="border-l-4 border-l-primary/20">
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
            onClick={() => onEdit(budget)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(budget.id)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
