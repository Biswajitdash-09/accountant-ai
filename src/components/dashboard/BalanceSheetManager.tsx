import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBalanceSheet, type BalanceSheetItem } from "@/hooks/useBalanceSheet";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddItemFormState {
  item_name: string;
  item_type: BalanceSheetItem['item_type'];
  category: string;
  amount: string;
  valuation_date: string;
  description: string;
  is_active: boolean;
}

interface EditItemFormState extends AddItemFormState {
  id: string;
}

const initialFormState: AddItemFormState = {
  item_name: '',
  item_type: 'current_asset',
  category: '',
  amount: '',
  valuation_date: new Date().toISOString().split('T')[0],
  description: '',
  is_active: true,
};

const getItemTypeVariant = (type: BalanceSheetItem['item_type']): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case 'current_asset':
    case 'fixed_asset':
      return 'default';
    case 'current_liability':
    case 'long_term_liability':
      return 'secondary';
    case 'equity':
      return 'outline';
    default:
      return 'default';
  }
};

const BalanceSheetManager = () => {
  const { balanceSheetItems, createBalanceSheetItem, updateBalanceSheetItem, deleteBalanceSheetItem, isLoading } = useBalanceSheet();
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formState, setFormState] = useState<AddItemFormState>(initialFormState);
  const [editItem, setEditItem] = useState<EditItemFormState | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formState.amount);
    if (isNaN(amount)) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const newItem: Omit<BalanceSheetItem, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      ...formState,
      amount,
      valuation_date: formState.valuation_date,
    };

    try {
      await createBalanceSheetItem.mutateAsync(newItem);
      toast({
        title: "Success",
        description: "Item added to balance sheet",
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!editItem) return;
  
    const amount = parseFloat(editItem.amount);
    if (isNaN(amount)) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
  
    try {
      await updateBalanceSheetItem.mutateAsync({
        id: editItem.id,
        item_name: editItem.item_name,
        item_type: editItem.item_type,
        category: editItem.category,
        amount,
        valuation_date: editItem.valuation_date,
        description: editItem.description,
        is_active: editItem.is_active,
      });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteBalanceSheetItem.mutateAsync(id);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: EditItemFormState) => {
    setEditItem(item);
    setFormState({
      item_name: item.item_name,
      item_type: item.item_type,
      category: item.category,
      amount: String(item.amount),
      valuation_date: item.valuation_date,
      description: item.description,
      is_active: item.is_active,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setFormState(initialFormState);
    setEditItem(null);
  };

  // Helper function to calculate totals with currency formatting
  const calculateTotalsByType = (type: BalanceSheetItem['item_type']) => {
    const items = balanceSheetItems.filter(item => item.item_type === type && item.is_active);
    const total = items.reduce((sum, item) => sum + Number(item.amount), 0);
    return {
      items,
      total,
      formattedTotal: formatCurrency(total, undefined, undefined, { showSymbol: true, showCode: false })
    };
  };

  const getBalanceClass = (balance: number): string => {
    if (balance > 0) {
      return 'text-green-500';
    } else if (balance < 0) {
      return 'text-red-500';
    } else {
      return 'text-muted-foreground';
    }
  };

  const getPriorityVariant = (priority: 'low' | 'medium' | 'high' | 'critical'): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'low':
        return 'outline';
      case 'medium':
        return 'default';
      case 'high':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const currentAssets = calculateTotalsByType('current_asset');
  const fixedAssets = calculateTotalsByType('fixed_asset');
  const currentLiabilities = calculateTotalsByType('current_liability');
  const longTermLiabilities = calculateTotalsByType('long_term_liability');
  const equity = calculateTotalsByType('equity');

  const totalAssets = currentAssets.total + fixedAssets.total;
  const totalLiabilities = currentLiabilities.total + longTermLiabilities.total;
  const totalEquity = equity.total;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEquity)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Display */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <CardDescription>
            Assets = Liabilities + Equity • Balance: <span className={getBalanceClass(totalAssets - (totalLiabilities + totalEquity))}>{formatCurrency(totalAssets - (totalLiabilities + totalEquity))}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Assets Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Assets</h3>
            
            {/* Current Assets */}
            <div className="mb-4">
              <h4 className="font-medium text-muted-foreground mb-2">Current Assets</h4>
              <div className="space-y-2 pl-4">
                {currentAssets.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.item_name}</span>
                    <span>{formatCurrency(Number(item.amount))}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Current Assets</span>
                  <span>{currentAssets.formattedTotal}</span>
                </div>
              </div>
            </div>

            {/* Fixed Assets */}
            <div className="mb-4">
              <h4 className="font-medium text-muted-foreground mb-2">Fixed Assets</h4>
              <div className="space-y-2 pl-4">
                {fixedAssets.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.item_name}</span>
                    <span>{formatCurrency(Number(item.amount))}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Fixed Assets</span>
                  <span>{fixedAssets.formattedTotal}</span>
                </div>
              </div>
            </div>

            <Separator />
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total Assets</span>
              <span>{formatCurrency(totalAssets)}</span>
            </div>
          </div>

          {/* Liabilities & Equity Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Liabilities & Equity</h3>
            
            {/* Current Liabilities */}
            <div className="mb-4">
              <h4 className="font-medium text-muted-foreground mb-2">Current Liabilities</h4>
              <div className="space-y-2 pl-4">
                {currentLiabilities.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.item_name}</span>
                    <span>{formatCurrency(Number(item.amount))}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Current Liabilities</span>
                  <span>{currentLiabilities.formattedTotal}</span>
                </div>
              </div>
            </div>

            {/* Long-term Liabilities */}
            <div className="mb-4">
              <h4 className="font-medium text-muted-foreground mb-2">Long-term Liabilities</h4>
              <div className="space-y-2 pl-4">
                {longTermLiabilities.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.item_name}</span>
                    <span>{formatCurrency(Number(item.amount))}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Long-term Liabilities</span>
                  <span>{longTermLiabilities.formattedTotal}</span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div className="mb-4">
              <h4 className="font-medium text-muted-foreground mb-2">Equity</h4>
              <div className="space-y-2 pl-4">
                {equity.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.item_name}</span>
                    <span>{formatCurrency(Number(item.amount))}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Equity</span>
                  <span>{equity.formattedTotal}</span>
                </div>
              </div>
            </div>

            <Separator />
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total Liabilities & Equity</span>
              <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the item details below.' : 'Enter the details for the new item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item_name" className="text-right">
                Name
              </Label>
              <Input
                type="text"
                id="item_name"
                name="item_name"
                value={formState.item_name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="item_type" className="text-right">
                Type
              </Label>
              <Select
                id="item_type"
                name="item_type"
                onValueChange={(value) => setFormState(prevState => ({ ...prevState, item_type: value as BalanceSheetItem['item_type'] }))}
                defaultValue={formState.item_type}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select item type" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                type="text"
                id="category"
                name="category"
                value={formState.category}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                type="number"
                id="amount"
                name="amount"
                value={formState.amount}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valuation_date" className="text-right">
                Valuation Date
              </Label>
              <Input
                type="date"
                id="valuation_date"
                name="valuation_date"
                value={formState.valuation_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right mt-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="is_active"
                  name="is_active"
                  checked={formState.is_active}
                  onCheckedChange={(checked) => setFormState(prevState => ({ ...prevState, is_active: checked }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit" onClick={isEditMode ? handleEditSubmit : handleSubmit}>
              {isEditMode ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Item Management</CardTitle>
          <CardDescription>
            Manage and track individual items within your balance sheet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {balanceSheetItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No items added yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valuation Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {balanceSheetItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.item_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Badge variant={getItemTypeVariant(item.item_type)}>{item.item_type}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(Number(item.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.valuation_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.is_active ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditItem({
                            id: item.id,
                            item_name: item.item_name,
                            item_type: item.item_type,
                            category: item.category,
                            amount: String(item.amount),
                            valuation_date: item.valuation_date,
                            description: item.description,
                            is_active: item.is_active,
                          })}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheetManager;
