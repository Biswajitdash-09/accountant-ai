import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvestmentTracking } from "@/hooks/useInvestmentTracking";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useCurrencies } from "@/hooks/useCurrencies";

export const InvestmentPortfolio = () => {
  const { investments, isLoading, addInvestment } = useInvestmentTracking();
  const { currencies } = useCurrencies();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    asset_type: 'stock' as const,
    symbol: '',
    quantity: '',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    currency_id: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInvestment.mutateAsync({
      ...formData,
      quantity: parseFloat(formData.quantity),
      purchase_price: parseFloat(formData.purchase_price),
      currency_id: formData.currency_id || undefined,
      notes: formData.notes || undefined,
    });
    setIsAddDialogOpen(false);
    setFormData({
      asset_type: 'stock',
      symbol: '',
      quantity: '',
      purchase_price: '',
      purchase_date: new Date().toISOString().split('T')[0],
      currency_id: '',
      notes: '',
    });
  };

  const calculatePortfolioStats = () => {
    const totalInvested = investments.reduce((sum, inv) => 
      sum + (inv.quantity * inv.purchase_price), 0
    );
    return { totalInvested };
  };

  const stats = calculatePortfolioStats();

  if (isLoading) {
    return <div>Loading investments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Investment Portfolio</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Investment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="asset_type">Asset Type</Label>
                <Select
                  value={formData.asset_type}
                  onValueChange={(value: any) => setFormData({ ...formData, asset_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="bond">Bond</SelectItem>
                    <SelectItem value="fund">Mutual Fund</SelectItem>
                    <SelectItem value="etf">ETF</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="symbol">Symbol/Ticker</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAPL, BTC, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.00000001"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="purchase_price">Purchase Price</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency_id}
                  onValueChange={(value) => setFormData({ ...formData, currency_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies?.map((currency) => (
                      <SelectItem key={currency.id} value={currency.id}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes about this investment"
                />
              </div>
              <Button type="submit" className="w-full">Add Investment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <p className="text-2xl font-bold">${stats.totalInvested.toFixed(2)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Positions</p>
              <p className="text-2xl font-bold">{investments.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Asset Types</p>
              <p className="text-2xl font-bold">
                {new Set(investments.map(i => i.asset_type)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {investments.map((investment) => (
          <Card key={investment.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{investment.symbol}</p>
                  <span className="text-sm font-normal text-muted-foreground">
                    {investment.asset_type}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantity:</span>
                  <span className="font-medium">{investment.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span className="font-medium">${investment.purchase_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="font-medium">
                    ${(investment.quantity * investment.purchase_price).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase Date:</span>
                  <span className="font-medium">
                    {new Date(investment.purchase_date).toLocaleDateString()}
                  </span>
                </div>
                {investment.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">{investment.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
