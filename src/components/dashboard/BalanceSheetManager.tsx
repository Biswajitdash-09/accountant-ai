import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useBalanceSheet, type BalanceSheetItem } from "@/hooks/useBalanceSheet";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, TrendingUp, TrendingDown, DollarSign, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ItemFormState {
  id?: string;
  item_name: string;
  item_type: 'current_asset' | 'fixed_asset' | 'current_liability' | 'long_term_liability' | 'equity';
  category: string;
  amount: string;
  valuation_date: string;
  description: string;
  is_active: boolean;
}

const defaultItemFormState: ItemFormState = {
  item_name: '',
  item_type: 'current_asset',
  category: '',
  amount: '',
  valuation_date: new Date().toISOString().split('T')[0],
  description: '',
  is_active: true,
};

const BalanceSheetManager = () => {
  const { balanceSheetItems, createBalanceSheetItem, updateBalanceSheetItem, deleteBalanceSheetItem, isLoading } = useBalanceSheet();
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemForm, setItemForm] = useState<ItemFormState>(defaultItemFormState);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setItemForm(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setItemForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { id, ...itemData } = itemForm;

    // Validate amount field
    const amount = parseFloat(itemData.amount);

    if (isNaN(amount)) {
      toast({
        title: "Error",
        description: "Amount must be a valid number",
        variant: "destructive",
      });
      return;
    }

    const item = {
      ...itemData,
      amount,
      valuation_date: itemData.valuation_date || undefined,
    }

    try {
      if (isEditing && id) {
        await updateBalanceSheetItem.mutateAsync({ id, ...item });
        toast({ description: 'Item updated successfully.' });
      } else {
        await createBalanceSheetItem.mutateAsync(item);
        toast({ description: 'Item created successfully.' });
      }
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save item",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: BalanceSheetItem) => {
    setIsEditing(true);
    setItemForm({
      id: item.id,
      item_name: item.item_name,
      item_type: item.item_type,
      category: item.category,
      amount: String(item.amount),
      valuation_date: item.valuation_date,
      description: item.description || '',
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteBalanceSheetItem.mutateAsync(itemId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setItemForm(defaultItemFormState);
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

  // Calculate balance sheet totals
  const assets = balanceSheetItems.filter(item => 
    item.item_type === 'current_asset' || item.item_type === 'fixed_asset'
  );
  const liabilities = balanceSheetItems.filter(item => 
    item.item_type === 'current_liability' || item.item_type === 'long_term_liability'
  );
  const equity = balanceSheetItems.filter(item => item.item_type === 'equity');

  const totalAssets = assets.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalLiabilities = liabilities.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalEquity = equity.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      {/* Balance Sheet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
            <p className="text-xs text-muted-foreground">
              {assets.length} asset{assets.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</div>
            <p className="text-xs text-muted-foreground">
              {liabilities.length} liabilit{liabilities.length !== 1 ? 'ies' : 'y'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEquity)}</div>
            <p className="text-xs text-muted-foreground">
              Net Worth: {formatCurrency(totalAssets - totalLiabilities)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Items Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Balance Sheet Items</CardTitle>
              <CardDescription>
                Manage your assets, liabilities, and equity positions
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? 'Update the details of your balance sheet item.' : 'Add a new asset, liability, or equity item to your balance sheet.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item_name" className="text-right">
                        Item Name
                      </Label>
                      <Input
                        type="text"
                        id="item_name"
                        name="item_name"
                        value={itemForm.item_name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item_type" className="text-right">
                        Item Type
                      </Label>
                      <Select 
                        value={itemForm.item_type} 
                        onValueChange={(value) => handleSelectChange(value, 'item_type')}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
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
                        value={itemForm.category}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
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
                        value={itemForm.amount}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                        min="0"
                        step="0.01"
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
                        value={itemForm.valuation_date}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={itemForm.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="is_active" className="text-right">
                        Active
                      </Label>
                      <div className="col-span-3">
                        <Input
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={itemForm.is_active}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {isEditing ? 'Update Item' : 'Create Item'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {balanceSheetItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <DollarSign className="mx-auto h-12 w-12 opacity-50 mb-4" />
              <p>No balance sheet items yet. Create your first item to get started!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Assets Section */}
              {assets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Assets</h3>
                  <div className="space-y-3">
                    {assets.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.item_name}</h4>
                                <Badge variant="outline">{item.item_type.replace('_', ' ')}</Badge>
                                {!item.is_active && <Badge variant="secondary">Inactive</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Valued on: {new Date(item.valuation_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(item.amount)}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Liabilities Section */}
              {liabilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Liabilities</h3>
                  <div className="space-y-3">
                    {liabilities.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.item_name}</h4>
                                <Badge variant="outline">{item.item_type.replace('_', ' ')}</Badge>
                                {!item.is_active && <Badge variant="secondary">Inactive</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Valued on: {new Date(item.valuation_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(item.amount)}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Equity Section */}
              {equity.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Equity</h3>
                  <div className="space-y-3">
                    {equity.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{item.item_name}</h4>
                                <Badge variant="outline">{item.item_type}</Badge>
                                {!item.is_active && <Badge variant="secondary">Inactive</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                Valued on: {new Date(item.valuation_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(item.amount)}</div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheetManager;
