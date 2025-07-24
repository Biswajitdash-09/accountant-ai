
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useBalanceSheet } from "@/hooks/useBalanceSheet";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import MetricCard from "./MetricCard";

const BalanceSheetManager = () => {
  const { balanceSheetItems, createBalanceSheetItem, updateBalanceSheetItem, deleteBalanceSheetItem, isLoading } = useBalanceSheet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    item_type: 'current_asset',
    category: '',
    amount: 0,
    valuation_date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    is_active: true,
  });

  const balanceSheetAnalytics = useMemo(() => {
    if (!balanceSheetItems.length) return null;

    const activeItems = balanceSheetItems.filter(item => item.is_active);
    
    const assets = activeItems.filter(item => item.item_type.includes('asset'));
    const liabilities = activeItems.filter(item => item.item_type.includes('liability'));
    const equity = activeItems.filter(item => item.item_type === 'equity');

    const totalAssets = assets.reduce((sum, item) => sum + item.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.amount, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.amount, 0);
    const calculatedEquity = totalAssets - totalLiabilities;

    const currentAssets = activeItems.filter(item => item.item_type === 'current_asset').reduce((sum, item) => sum + item.amount, 0);
    const currentLiabilities = activeItems.filter(item => item.item_type === 'current_liability').reduce((sum, item) => sum + item.amount, 0);
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      calculatedEquity,
      currentRatio,
      netWorth: totalAssets - totalLiabilities,
      assetsCount: assets.length,
      liabilitiesCount: liabilities.length,
      equityCount: equity.length,
    };
  }, [balanceSheetItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateBalanceSheetItem.mutateAsync({ id: editingItem.id, ...formData });
      } else {
        await createBalanceSheetItem.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({
        item_name: '',
        item_type: 'current_asset',
        category: '',
        amount: 0,
        valuation_date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        is_active: true,
      });
    } catch (error) {
      console.error('Balance sheet operation error:', error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      item_type: item.item_type,
      category: item.category,
      amount: item.amount,
      valuation_date: item.valuation_date,
      description: item.description || '',
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {
      current_asset: [],
      fixed_asset: [],
      current_liability: [],
      long_term_liability: [],
      equity: [],
    };

    balanceSheetItems.forEach(item => {
      if (groups[item.item_type]) {
        groups[item.item_type].push(item);
      }
    });

    return groups;
  }, [balanceSheetItems]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading balance sheet...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      {balanceSheetAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Assets"
            value={`$${balanceSheetAnalytics.totalAssets.toLocaleString()}`}
            icon={<TrendingUp className="h-4 w-4" />}
            description={`${balanceSheetAnalytics.assetsCount} items`}
          />
          <MetricCard
            title="Total Liabilities"
            value={`$${balanceSheetAnalytics.totalLiabilities.toLocaleString()}`}
            icon={<TrendingDown className="h-4 w-4" />}
            description={`${balanceSheetAnalytics.liabilitiesCount} items`}
          />
          <MetricCard
            title="Net Worth"
            value={`$${balanceSheetAnalytics.netWorth.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4" />}
            trend={{
              value: balanceSheetAnalytics.netWorth,
              positive: balanceSheetAnalytics.netWorth > 0,
            }}
            description="Assets - Liabilities"
          />
          <MetricCard
            title="Current Ratio"
            value={balanceSheetAnalytics.currentRatio.toFixed(2)}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={{
              value: balanceSheetAnalytics.currentRatio,
              positive: balanceSheetAnalytics.currentRatio > 1,
            }}
            description="Liquidity measure"
          />
        </div>
      )}

      {/* Balance Sheet Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Balance Sheet</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value })}>
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
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="liabilities">Liabilities</TabsTrigger>
              <TabsTrigger value="equity">Equity</TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="space-y-4">
              <div className="space-y-6">
                {/* Current Assets */}
                <div>
                  <h3 className="font-semibold mb-3">Current Assets</h3>
                  <div className="space-y-2">
                    {groupedItems.current_asset.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{item.item_name}</span>
                          <Badge variant="outline" className="ml-2">{item.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">${item.amount.toLocaleString()}</span>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteBalanceSheetItem.mutate(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Assets */}
                <div>
                  <h3 className="font-semibold mb-3">Fixed Assets</h3>
                  <div className="space-y-2">
                    {groupedItems.fixed_asset.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{item.item_name}</span>
                          <Badge variant="outline" className="ml-2">{item.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">${item.amount.toLocaleString()}</span>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteBalanceSheetItem.mutate(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="liabilities" className="space-y-4">
              <div className="space-y-6">
                {/* Current Liabilities */}
                <div>
                  <h3 className="font-semibold mb-3">Current Liabilities</h3>
                  <div className="space-y-2">
                    {groupedItems.current_liability.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{item.item_name}</span>
                          <Badge variant="outline" className="ml-2">{item.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-red-600">${item.amount.toLocaleString()}</span>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteBalanceSheetItem.mutate(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Long-term Liabilities */}
                <div>
                  <h3 className="font-semibold mb-3">Long-term Liabilities</h3>
                  <div className="space-y-2">
                    {groupedItems.long_term_liability.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">{item.item_name}</span>
                          <Badge variant="outline" className="ml-2">{item.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-red-600">${item.amount.toLocaleString()}</span>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteBalanceSheetItem.mutate(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="equity" className="space-y-4">
              <div className="space-y-2">
                {groupedItems.equity.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{item.item_name}</span>
                      <Badge variant="outline" className="ml-2">{item.category}</Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-green-600">${item.amount.toLocaleString()}</span>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteBalanceSheetItem.mutate(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheetManager;
