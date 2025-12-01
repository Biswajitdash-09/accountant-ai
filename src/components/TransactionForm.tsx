
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTransactions, Transaction } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useRevenueStreams } from "@/hooks/useRevenueStreams";
import { useCostCenters } from "@/hooks/useCostCenters";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Loader2, DollarSign, Calendar, Tag, FileText } from "lucide-react";

interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TransactionForm = ({ transaction, onSuccess, onCancel }: TransactionFormProps) => {
  const { createTransaction, updateTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { revenueStreams } = useRevenueStreams();
  const { costCenters } = useCostCenters();
  const { currencies, baseCurrency } = useCurrencies();
  const { preferences } = useUserPreferences();
  
  const [formData, setFormData] = useState({
    amount: transaction?.amount || 0,
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || "",
    subcategory: transaction?.subcategory || "",
    type: transaction?.type || "expense" as "income" | "expense",
    description: transaction?.description || "",
    notes: transaction?.notes || "",
    account_id: transaction?.account_id || "",
    revenue_stream_id: transaction?.revenue_stream_id || "",
    cost_center: transaction?.cost_center || "",
    is_recurring: transaction?.is_recurring || false,
    currency_id: transaction?.currency_id || preferences?.default_currency_id || baseCurrency?.id || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = [
    "Rent", "Utilities", "Software", "Marketing", "Travel", "Office Supplies",
    "Professional Services", "Insurance", "Equipment", "Food & Entertainment",
    "Transportation", "Healthcare", "Education", "Taxes", "Other"
  ];

  const incomeCategories = [
    "Sales", "Consulting", "Services", "Grants", "Investments", "Royalties",
    "Rental Income", "Commission", "Bonus", "Refund", "Other"
  ];

  const categories = formData.type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const transactionData = {
        ...formData,
        amount: Math.abs(formData.amount), // Ensure positive amount
        currency_id: formData.currency_id || preferences?.default_currency_id || baseCurrency?.id || ""
      };

      if (transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, ...transactionData });
      } else {
        await createTransaction.mutateAsync(transactionData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Reset form if no onCancel handler
      setFormData({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: "",
        subcategory: "",
        type: "expense",
        description: "",
        notes: "",
        account_id: "",
        revenue_stream_id: "",
        cost_center: "",
        is_recurring: false,
        currency_id: preferences?.default_currency_id || baseCurrency?.id || ""
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mobile-section">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transaction Type */}
        <div className="space-y-2">
          <Label htmlFor="type" className="mobile-form-label">Transaction Type</Label>
          <Select value={formData.type} onValueChange={(value: "income" | "expense") => {
            setFormData({ ...formData, type: value, category: "" });
          }}>
            <SelectTrigger className="mobile-form-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[100]">
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="mobile-form-label">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ""}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="pl-10 mobile-form-field"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency" className="mobile-form-label">Currency</Label>
          <Select value={formData.currency_id} onValueChange={(value) => setFormData({ ...formData, currency_id: value })}>
            <SelectTrigger className="mobile-form-field">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent className="z-[100]">
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

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="mobile-form-label">Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="pl-10 mobile-form-field"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description" className="mobile-form-label">Description</Label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="pl-10 mobile-form-field"
              placeholder="Brief description of the transaction"
              required
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="mobile-form-label">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="mobile-form-field">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-[300px]">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory */}
        <div className="space-y-2">
          <Label htmlFor="subcategory" className="mobile-form-label">Subcategory (Optional)</Label>
          <Input
            id="subcategory"
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            placeholder="More specific category"
            className="mobile-form-field"
          />
        </div>

        {/* Account */}
        <div className="space-y-2">
          <Label htmlFor="account" className="mobile-form-label">Account</Label>
          <Select value={formData.account_id} onValueChange={(value) => setFormData({ ...formData, account_id: value })}>
            <SelectTrigger className="mobile-form-field">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-[300px]">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_name} ({account.account_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Revenue Stream (for income) */}
        {formData.type === "income" && (
          <div className="space-y-2">
            <Label htmlFor="revenue_stream" className="mobile-form-label">Revenue Stream</Label>
            <Select value={formData.revenue_stream_id} onValueChange={(value) => setFormData({ ...formData, revenue_stream_id: value })}>
              <SelectTrigger className="mobile-form-field">
                <SelectValue placeholder="Select revenue stream" />
              </SelectTrigger>
              <SelectContent className="z-[100] max-h-[300px]">
                {revenueStreams.map((stream) => (
                  <SelectItem key={stream.id} value={stream.id}>
                    {stream.stream_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Cost Center */}
        <div className="space-y-2">
          <Label htmlFor="cost_center" className="mobile-form-label">Cost Center</Label>
          <Select value={formData.cost_center} onValueChange={(value) => setFormData({ ...formData, cost_center: value })}>
            <SelectTrigger className="mobile-form-field">
              <SelectValue placeholder="Select cost center" />
            </SelectTrigger>
            <SelectContent className="z-[100] max-h-[300px]">
              {costCenters.map((center) => (
                <SelectItem key={center.id} value={center.name}>
                  {center.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="mobile-form-label">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or details about this transaction"
          rows={3}
          className="mobile-form-field resize-none"
        />
      </div>

      {/* Recurring Transaction */}
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={formData.is_recurring}
          onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
        />
        <Label htmlFor="recurring">This is a recurring transaction</Label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1 mobile-touch touch-feedback">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {transaction ? "Updating..." : "Creating..."}
            </>
          ) : (
            transaction ? "Update Transaction" : "Create Transaction"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
