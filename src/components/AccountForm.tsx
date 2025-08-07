
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Loader2, Wallet, DollarSign } from "lucide-react";

interface AccountFormProps {
  account?: Account;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AccountForm = ({ account, onSuccess, onCancel }: AccountFormProps) => {
  const { createAccount, updateAccount } = useAccounts();
  const { currencies, baseCurrency } = useCurrencies();
  const { preferences } = useUserPreferences();
  
  const [formData, setFormData] = useState({
    account_name: account?.account_name || "",
    account_type: account?.account_type || "",
    balance: account?.balance || 0,
    currency_id: account?.currency_id || preferences?.default_currency_id || baseCurrency?.id || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountTypes = [
    "checking",
    "savings", 
    "credit_card",
    "investment",
    "business",
    "cash",
    "loan",
    "other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Account form submission started', { formData });
    
    if (!formData.account_name.trim()) {
      console.error('Account name validation failed');
      alert("Account name is required");
      return;
    }

    if (!formData.account_type.trim()) {
      console.error('Account type validation failed');
      alert("Account type is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const accountData = {
        ...formData,
        currency_id: formData.currency_id || preferences?.default_currency_id || baseCurrency?.id || ""
      };

      console.log('Submitting account data:', accountData);

      if (account) {
        await updateAccount.mutateAsync({ id: account.id, ...accountData });
        console.log('Account updated successfully');
      } else {
        await createAccount.mutateAsync(accountData);
        console.log('Account created successfully');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving account:', error);
      alert(`Failed to ${account ? 'update' : 'create'} account: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setFormData({
        account_name: "",
        account_type: "",
        balance: 0,
        currency_id: preferences?.default_currency_id || baseCurrency?.id || ""
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="account_name">Account Name</Label>
          <div className="relative">
            <Wallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              className="pl-10"
              placeholder="e.g., Main Checking Account"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_type">Account Type</Label>
          <Select value={formData.account_type} onValueChange={(value) => setFormData({ ...formData, account_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              {accountTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="balance">Initial Balance</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance || ""}
              onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
              className="pl-10"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency_id} onValueChange={(value) => setFormData({ ...formData, currency_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.id} value={currency.id}>
                  <div className="flex items-center gap-2">
                    <span>{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <span className="text-sm text-muted-foreground">({currency.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {account ? "Updating..." : "Creating..."}
            </>
          ) : (
            account ? "Update Account" : "Create Account"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;
