
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useBalanceSheet } from "@/hooks/useBalanceSheet";
import { format } from "date-fns";

const BalanceSheetManager = () => {
  const { balanceSheetItems, createBalanceSheetItem, updateBalanceSheetItem, deleteBalanceSheetItem } = useBalanceSheet();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: 'current_asset' as 'current_asset' | 'fixed_asset' | 'current_liability' | 'long_term_liability' | 'equity',
    category: '',
    amount: 0,
    valuation_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateBalanceSheetItem.mutateAsync({
          id: editingItem,
          ...formData,
        });
        setEditingItem(null);
      } else {
        await createBalanceSheetItem.mutateAsync(formData);
        setIsAddingItem(false);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving balance sheet item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      item_type: 'current_asset',
      category: '',
      amount: 0,
      valuation_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      is_active: true,
    });
  };

  const handleEdit = (item: any) => {
    setFormData({
      item_name: item.item_name,
      item_type: item.item_type,
      category: item.category,
      amount: item.amount,
      valuation_date: item.valuation_date,
      description: item.description || '',
      is_active: item.is_active,
    });
    setEditingItem(item.id);
    setIsAddingItem(true);
  };

  const handleDelete = async (id: string) => {
    await deleteBalanceSheetItem.mutateAsync(id);
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'current_asset': return 'Current Asset';
      case 'fixed_asset': return 'Fixed Asset';
      case 'current_liability': return 'Current Liability';
      case 'long_term_liability': return 'Long-term Liability';
      case 'equity': return 'Equity';
      default: return type;
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'current_asset':
      case 'fixed_asset':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'current_liability':
      case 'long_term_liability':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'equity':
        return <Minus className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'current_asset':
      case 'fixed_asset':
        return 'success';
      case 'current_liability':
      case 'long_term_liability':
        return 'destructive';
      case 'equity':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Calculate totals
  const totals = balanceSheetItems.reduce((acc, item) => {
    if (item.item_type === 'current_asset' || item.item_type === 'fixed_asset') {
      acc.assets += item.amount;
    } else if (item.item_type === 'current_liability' || item.item_type === 'long_term_liability') {
      acc.liabilities += item.amount;
    } else if (item.item_type === 'equity') {
      acc.equity += item.amount;
    }
    return acc;
  }, { assets: 0, liabilities: 0, equity: 0 });

  if (isAddingItem || editingItem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editingItem ? 'Edit Balance Sheet Item' : 'Add New Balance Sheet Item'}</CardTitle>
          <CardDescription>
            {editingItem ? 'Update balance sheet item details' : 'Add a new asset, liability, or equity item'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_name">Item Name</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="item_type">Item Type</Label>
                <Select value={formData.item_type} onValueChange={(value: 'current_asset' | 'fixed_asset' | 'current_liability' | 'long_term_liability' | 'equity') => setFormData({ ...formData, item_type: value })}>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="valuation_date">Valuation Date</Label>
              <Input
                id="valuation_date"
                type="date"
                value={formData.valuation_date}
                onChange={(e) => setFormData({ ...formData, valuation_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingItem(false);
                  setEditingItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Balance Sheet</h3>
          <p className="text-sm text-muted-foreground">
            Monitor your assets, liabilities, and equity
          </p>
        </div>
        <Button onClick={() => setIsAddingItem(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-green-600">${totals.assets.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold text-red-600">${totals.liabilities.toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Equity</p>
                <p className="text-2xl font-bold text-blue-600">${totals.equity.toLocaleString()}</p>
              </div>
              <Minus className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Items */}
      <div className="grid gap-4">
        {balanceSheetItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {getItemTypeIcon(item.item_type)}
                  <div>
                    <CardTitle className="text-lg">{item.item_name}</CardTitle>
                    <CardDescription>
                      {item.category} • {format(new Date(item.valuation_date), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getItemTypeColor(item.item_type) as any}>
                    {getItemTypeLabel(item.item_type)}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">${item.amount.toLocaleString()}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {balanceSheetItems.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No balance sheet items yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first asset, liability, or equity item to get started
            </p>
            <Button onClick={() => setIsAddingItem(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BalanceSheetManager;
