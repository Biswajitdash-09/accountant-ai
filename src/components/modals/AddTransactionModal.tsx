
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { Plus } from "lucide-react";

interface AddTransactionModalProps {
  trigger?: React.ReactNode;
}

const AddTransactionModal = ({ trigger }: AddTransactionModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    type: "expense" as "income" | "expense",
    notes: "",
    description: "",
    account_id: "",
  });

  const { createTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.date) {
      return;
    }

    try {
      await createTransaction.mutateAsync({
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category || undefined,
        type: formData.type,
        notes: formData.notes || undefined,
        description: formData.description || undefined,
        account_id: formData.account_id || undefined,
      });
      
      setFormData({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        category: "",
        type: "expense",
        notes: "",
        description: "",
        account_id: "",
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="mobile-section">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mobile-form-field"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="mobile-form-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mobile-form-field"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select value={formData.account_id} onValueChange={(value) => setFormData({ ...formData, account_id: value })}>
              <SelectTrigger className="mobile-form-field">
                <SelectValue placeholder="Select account (optional)" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of the transaction"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mobile-form-field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Office Supplies, Travel, Food"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mobile-form-field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mobile-form-field resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTransaction.isPending} className="mobile-touch touch-feedback">
              {createTransaction.isPending ? "Creating..." : "Create Transaction"}
            </Button>
          </div>
        </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add New Transaction</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
