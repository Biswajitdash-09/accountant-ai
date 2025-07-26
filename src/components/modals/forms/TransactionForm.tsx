
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TransactionData {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

interface TransactionFormProps {
  transactionData: TransactionData;
  setTransactionData: (data: TransactionData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TransactionForm = ({ transactionData, setTransactionData, onSubmit }: TransactionFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={transactionData.amount}
            onChange={(e) => setTransactionData({ ...transactionData, amount: Number(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select value={transactionData.type} onValueChange={(value: 'income' | 'expense') => setTransactionData({ ...transactionData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={transactionData.category}
            onChange={(e) => setTransactionData({ ...transactionData, category: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={transactionData.date}
            onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={transactionData.description}
          onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full">Add Transaction</Button>
    </form>
  );
};
