
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useRevenueStreams } from "@/hooks/useRevenueStreams";
import { useFinancialGoals } from "@/hooks/useFinancialGoals";
import { useBudgets } from "@/hooks/useBudgets";
import { useBalanceSheet } from "@/hooks/useBalanceSheet";
import { useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";

interface AddFinancialDataModalProps {
  children?: React.ReactNode;
}

const AddFinancialDataModal = ({ children }: AddFinancialDataModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('transaction');

  const { createRevenueStream } = useRevenueStreams();
  const { createFinancialGoal } = useFinancialGoals();
  const { createBudget } = useBudgets();
  const { createBalanceSheetItem } = useBalanceSheet();
  const { createTransaction } = useTransactions();

  const [transactionData, setTransactionData] = useState({
    amount: 0,
    type: 'expense',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const [revenueData, setRevenueData] = useState({
    stream_name: '',
    stream_type: 'sales',
    description: '',
    target_amount: 0,
    actual_amount: 0,
    is_active: true,
  });

  const [goalData, setGoalData] = useState({
    goal_name: '',
    goal_type: 'savings',
    target_amount: 0,
    current_amount: 0,
    priority: 'medium',
    description: '',
  });

  const [budgetData, setBudgetData] = useState({
    name: '',
    budget_period: 'monthly',
    total_budget: 0,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    categories: [],
    is_active: true,
  });

  const [balanceSheetData, setBalanceSheetData] = useState({
    item_name: '',
    item_type: 'current_asset',
    category: '',
    amount: 0,
    valuation_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent, type: string) => {
    e.preventDefault();
    try {
      switch (type) {
        case 'transaction':
          await createTransaction.mutateAsync(transactionData);
          break;
        case 'revenue':
          await createRevenueStream.mutateAsync(revenueData);
          break;
        case 'goal':
          await createFinancialGoal.mutateAsync(goalData);
          break;
        case 'budget':
          await createBudget.mutateAsync(budgetData);
          break;
        case 'balance':
          await createBalanceSheetItem.mutateAsync(balanceSheetData);
          break;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating financial data:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Financial Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Financial Data</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="goal">Goal</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="balance">Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="transaction">
            <form onSubmit={(e) => handleSubmit(e, 'transaction')} className="space-y-4">
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
                  <Select value={transactionData.type} onValueChange={(value) => setTransactionData({ ...transactionData, type: value })}>
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
          </TabsContent>

          <TabsContent value="revenue">
            <form onSubmit={(e) => handleSubmit(e, 'revenue')} className="space-y-4">
              <div>
                <Label htmlFor="stream_name">Stream Name</Label>
                <Input
                  id="stream_name"
                  value={revenueData.stream_name}
                  onChange={(e) => setRevenueData({ ...revenueData, stream_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stream_type">Stream Type</Label>
                <Select value={revenueData.stream_type} onValueChange={(value) => setRevenueData({ ...revenueData, stream_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="donations">Donations</SelectItem>
                    <SelectItem value="loans">Loans</SelectItem>
                    <SelectItem value="grants">Grants</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={revenueData.target_amount}
                    onChange={(e) => setRevenueData({ ...revenueData, target_amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="actual_amount">Actual Amount</Label>
                  <Input
                    id="actual_amount"
                    type="number"
                    value={revenueData.actual_amount}
                    onChange={(e) => setRevenueData({ ...revenueData, actual_amount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={revenueData.description}
                  onChange={(e) => setRevenueData({ ...revenueData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Add Revenue Stream</Button>
            </form>
          </TabsContent>

          <TabsContent value="goal">
            <form onSubmit={(e) => handleSubmit(e, 'goal')} className="space-y-4">
              <div>
                <Label htmlFor="goal_name">Goal Name</Label>
                <Input
                  id="goal_name"
                  value={goalData.goal_name}
                  onChange={(e) => setGoalData({ ...goalData, goal_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="goal_type">Goal Type</Label>
                <Select value={goalData.goal_type} onValueChange={(value) => setGoalData({ ...goalData, goal_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_amount">Target Amount</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    value={goalData.target_amount}
                    onChange={(e) => setGoalData({ ...goalData, target_amount: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="current_amount">Current Amount</Label>
                  <Input
                    id="current_amount"
                    type="number"
                    value={goalData.current_amount}
                    onChange={(e) => setGoalData({ ...goalData, current_amount: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={goalData.priority} onValueChange={(value) => setGoalData({ ...goalData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={goalData.description}
                  onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Add Financial Goal</Button>
            </form>
          </TabsContent>

          <TabsContent value="budget">
            <form onSubmit={(e) => handleSubmit(e, 'budget')} className="space-y-4">
              <div>
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  value={budgetData.name}
                  onChange={(e) => setBudgetData({ ...budgetData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="budget_period">Budget Period</Label>
                <Select value={budgetData.budget_period} onValueChange={(value) => setBudgetData({ ...budgetData, budget_period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="total_budget">Total Budget</Label>
                <Input
                  id="total_budget"
                  type="number"
                  value={budgetData.total_budget}
                  onChange={(e) => setBudgetData({ ...budgetData, total_budget: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={budgetData.start_date}
                    onChange={(e) => setBudgetData({ ...budgetData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={budgetData.end_date}
                    onChange={(e) => setBudgetData({ ...budgetData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Add Budget</Button>
            </form>
          </TabsContent>

          <TabsContent value="balance">
            <form onSubmit={(e) => handleSubmit(e, 'balance')} className="space-y-4">
              <div>
                <Label htmlFor="item_name">Item Name</Label>
                <Input
                  id="item_name"
                  value={balanceSheetData.item_name}
                  onChange={(e) => setBalanceSheetData({ ...balanceSheetData, item_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="item_type">Item Type</Label>
                <Select value={balanceSheetData.item_type} onValueChange={(value) => setBalanceSheetData({ ...balanceSheetData, item_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_asset">Current Asset</SelectItem>
                    <SelectItem value="fixed_asset">Fixed Asset</SelectItem>
                    <SelectItem value="current_liability">Current Liability</SelectItem>
                    <SelectItem value="long_term_liability">Long-term Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={balanceSheetData.category}
                    onChange={(e) => setBalanceSheetData({ ...balanceSheetData, category: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={balanceSheetData.amount}
                    onChange={(e) => setBalanceSheetData({ ...balanceSheetData, amount: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="valuation_date">Valuation Date</Label>
                <Input
                  id="valuation_date"
                  type="date"
                  value={balanceSheetData.valuation_date}
                  onChange={(e) => setBalanceSheetData({ ...balanceSheetData, valuation_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={balanceSheetData.description}
                  onChange={(e) => setBalanceSheetData({ ...balanceSheetData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Add Balance Sheet Item</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFinancialDataModal;
