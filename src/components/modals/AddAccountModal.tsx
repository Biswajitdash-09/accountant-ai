
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { Plus, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
interface AddAccountModalProps {
  trigger?: React.ReactNode;
}

const AddAccountModal = ({ trigger }: AddAccountModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    account_name: "",
    account_type: "",
    balance: "",
  });
  const [linking, setLinking] = useState(false);

  const { createAccount } = useAccounts();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_name || !formData.account_type) {
      return;
    }

    try {
      await createAccount.mutateAsync({
        account_name: formData.account_name,
        account_type: formData.account_type,
        balance: parseFloat(formData.balance) || 0,
      });
      
      setFormData({
        account_name: "",
        account_type: "",
        balance: "",
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const handleLinkBank = async () => {
    try {
      setLinking(true);
      const { data, error } = await supabase.functions.invoke('yodlee-init');
      if (error) throw error;
      const message = (data as any)?.message || 'Bank linking initialized.';
      toast({ title: 'Bank Linking', description: message });
    } catch (err: any) {
      console.error('Yodlee init error:', err);
      toast({ title: 'Bank Linking Failed', description: 'Please check configuration and try again.', variant: 'destructive' });
    } finally {
      setLinking(false);
    }
  };

  const formContent = (
    <>
      <div className="rounded-lg border p-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Link your bank</p>
              <p className="text-xs text-muted-foreground">Securely connect via Yodlee.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLinkBank} disabled={linking}>
              <Link2 className="h-4 w-4 mr-2" /> {linking ? 'Checking...' : 'Link Bank'}
            </Button>
          </div>
      </div>
      <form onSubmit={handleSubmit} className="mobile-section">
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name</Label>
            <Input
              id="account_name"
              placeholder="e.g., Business Checking"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="mobile-form-field"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type</Label>
            <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
              <SelectTrigger className="mobile-form-field">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="credit">Credit Card</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Initial Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="mobile-form-field"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAccount.isPending} className="mobile-touch touch-feedback">
              {createAccount.isPending ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add New Account</DrawerTitle>
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
            Add Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;
