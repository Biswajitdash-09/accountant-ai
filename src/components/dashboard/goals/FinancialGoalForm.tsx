
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Target, DollarSign } from "lucide-react";

interface GoalFormState {
  goal_name: string;
  description: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
  goal_type: string;
}

interface FinancialGoalFormProps {
  onSubmit: (goalData: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: Partial<any>;
  mode?: 'create' | 'edit';
}

const FinancialGoalForm = ({ onSubmit, onCancel, isSubmitting, initialData, mode = 'create' }: FinancialGoalFormProps) => {
  const [formData, setFormData] = useState<GoalFormState>({
    goal_name: "",
    description: "",
    target_amount: "",
    current_amount: "0",
    target_date: "",
    goal_type: "savings"
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        goal_name: String(initialData.goal_name ?? ""),
        description: String(initialData.description ?? ""),
        target_amount: initialData.target_amount !== undefined ? String(initialData.target_amount) : "",
        current_amount: initialData.current_amount !== undefined ? String(initialData.current_amount) : "0",
        target_date: String(initialData.target_date ?? ""),
        goal_type: String(initialData.goal_type ?? "savings")
      });
    }
  }, [initialData]);

  const handleInputChange = (field: keyof GoalFormState, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      goal_name: formData.goal_name,
      goal_type: formData.goal_type,
      description: formData.description,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount),
      target_date: formData.target_date,
      priority: 'medium' as const,
      is_achieved: false
    };
    
    onSubmit(goalData);
  };

  const goalTypes = [
    { value: "savings", label: "Savings" },
    { value: "investment", label: "Investment" },
    { value: "debt_reduction", label: "Debt Reduction" },
    { value: "revenue", label: "Revenue" },
    { value: "expense_reduction", label: "Expense Reduction" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Create New Financial Goal
        </CardTitle>
        <CardDescription>
          Set a financial target and track your progress towards achieving it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal_name">Goal Name</Label>
              <Input
                id="goal_name"
                value={formData.goal_name}
                onChange={(e) => handleInputChange("goal_name", e.target.value)}
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goal_type">Goal Type</Label>
              <Select
                value={formData.goal_type}
                onValueChange={(value) => handleInputChange("goal_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((goalType) => (
                    <SelectItem key={goalType.value} value={goalType.value}>
                      {goalType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your financial goal..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">Target Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => handleInputChange("target_amount", e.target.value)}
                  placeholder="10000.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current_amount">Current Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onChange={(e) => handleInputChange("current_amount", e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange("target_date", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating Goal..." : "Create Goal"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialGoalForm;
