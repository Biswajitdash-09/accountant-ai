
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAccounts } from "@/hooks/useAccounts";

interface AddAccountModalProps {
  trigger?: React.ReactNode;
}

const AddAccountModal = ({ trigger }: AddAccountModalProps) => {
  const [open, setOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const { toast } = useToast();
  const { createAccount } = useAccounts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName || !accountType || !initialBalance) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAccount.mutateAsync({
        account_name: accountName,
        account_type: accountType,
        balance: parseFloat(initialBalance),
      });

      toast({
        title: "Account Added",
        description: `${accountName} has been added successfully`,
      });

      // Reset form
      setAccountName("");
      setAccountType("");
      setInitialBalance("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Add Account</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Create a new financial account to track your transactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g., Business Checking"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">Initial Balance</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;
