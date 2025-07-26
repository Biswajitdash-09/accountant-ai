
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface BudgetFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  formState: BudgetFormState;
  editingBudget: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSwitchChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export const BudgetFormDialog = ({
  isOpen,
  setIsOpen,
  formState,
  editingBudget,
  onInputChange,
  onSwitchChange,
  onSubmit,
  children
}: BudgetFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onCheckedChange={onSwitchChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={onSubmit}>
            {editingBudget ? "Update Budget" : "Create Budget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
