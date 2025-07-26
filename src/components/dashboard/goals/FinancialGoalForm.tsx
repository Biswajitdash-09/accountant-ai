
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GoalFormState {
  id?: string;
  goal_name: string;
  goal_type: 'savings' | 'investment' | 'debt_reduction' | 'revenue' | 'expense_reduction';
  target_amount: string;
  current_amount: string;
  target_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  is_achieved: boolean;
  currency_id?: string;
}

interface FinancialGoalFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  goalForm: GoalFormState;
  setGoalForm: (form: GoalFormState) => void;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export const FinancialGoalForm = ({
  isOpen,
  setIsOpen,
  goalForm,
  setGoalForm,
  isEditing,
  onSubmit,
  children
}: FinancialGoalFormProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGoalForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setGoalForm(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details of your financial goal.' : 'Define a new financial goal to track your progress.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal_name" className="text-right">
                Goal Name
              </Label>
              <Input
                type="text"
                id="goal_name"
                name="goal_name"
                value={goalForm.goal_name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal_type" className="text-right">
                Goal Type
              </Label>
              <Select value={goalForm.goal_type} onValueChange={(value) => setGoalForm(prevState => ({ ...prevState, goal_type: value as GoalFormState['goal_type'] }))} >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="debt_reduction">Debt Reduction</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense_reduction">Expense Reduction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target_amount" className="text-right">
                Target Amount
              </Label>
              <Input
                type="number"
                id="target_amount"
                name="target_amount"
                value={goalForm.target_amount}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current_amount" className="text-right">
                Current Amount
              </Label>
              <Input
                type="number"
                id="current_amount"
                name="current_amount"
                value={goalForm.current_amount}
                onChange={handleInputChange}
                className="col-span-3"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target_date" className="text-right">
                Target Date
              </Label>
              <Input
                type="date"
                id="target_date"
                name="target_date"
                value={goalForm.target_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select value={goalForm.priority} onValueChange={(value) => setGoalForm(prevState => ({ ...prevState, priority: value as GoalFormState['priority'] }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={goalForm.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_achieved" className="text-right">
                Achieved
              </Label>
              <div className="col-span-3">
                <Input
                  type="checkbox"
                  id="is_achieved"
                  name="is_achieved"
                  checked={goalForm.is_achieved}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
