
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, RefreshCw, Plus, Trash2, Calculator, DollarSign } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";

interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

const Markets = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  const [assets, setAssets] = useState<CryptoAsset[]>([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 121,
      avgPrice: 50000000,
      currentPrice: 102861.95,
    },
    {
      id: '2', 
      symbol: 'ETH',
      name: 'Ethereum',
      quantity: 1000,
      avgPrice: 111111.11,
      currentPrice: 331.105,
    },
    {
      id: '3',
      symbol: 'SOL',
      name: 'Solana', 
      quantity: 212121,
      avgPrice: 544545.45,
      currentPrice: 150,
    }
  ]);

  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [showAddAsset, setShowAddAsset] = useState(false);
  
  const { register, handleSubmit, reset } = useForm();

  // Calculate portfolio metrics with positive values
  const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
  const totalCost = assets.reduce((sum, asset) => sum + (asset.quantity * asset.avgPrice), 0);
  const totalPnL = Math.abs(totalValue - totalCost); // Always positive
  const pnlPercentage = totalCost > 0 ? Math.abs((totalPnL / totalCost) * 100) : 0; // Always positive

  const calculateAssetMetrics = (asset: CryptoAsset) => {
    const marketValue = asset.quantity * asset.currentPrice;
    const costBasis = asset.quantity * asset.avgPrice;
    const pnl = Math.abs(marketValue - costBasis); // Always positive
    const pnlPercent = costBasis > 0 ? Math.abs((pnl / costBasis) * 100) : 0; // Always positive
    
    return {
      marketValue,
      costBasis,
      pnl,
      pnlPercent,
      isGain: marketValue >= costBasis
    };
  };

  const handleRefresh = () => {
    // Simulate price updates with random positive changes
    setAssets(prevAssets => 
      prevAssets.map(asset => ({
        ...asset,
        currentPrice: asset.currentPrice * (0.95 + Math.random() * 0.1) // Random change between -5% to +5%
      }))
    );
    
    toast({
      title: "Portfolio Refreshed",
      description: "Asset prices have been updated",
    });
  };

  const handleAddAsset = (data: any) => {
    const newAsset: CryptoAsset = {
      id: Date.now().toString(),
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      quantity: parseFloat(data.quantity),
      avgPrice: parseFloat(data.avgPrice),
      currentPrice: parseFloat(data.currentPrice) || parseFloat(data.avgPrice),
    };
    
    setAssets(prev => [...prev, newAsset]);
    setShowAddAsset(false);
    reset();
    
    toast({
      title: "Asset Added",
      description: `${newAsset.symbol} has been added to your portfolio`,
    });
  };

  const handleRemoveAsset = (id: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== id));
    toast({
      title: "Asset Removed",
      description: "Asset has been removed from your portfolio",
    });
  };

  const handleCurrencyConversion = () => {
    // Simulate currency conversion
    const mockResult: ConversionResult = {
      from: 'USD',
      to: 'INR',
      amount: 1000,
      result: 83500,
      rate: 83.5,
    };
    setConversionResult(mockResult);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Markets & Portfolio</h1>
          <p className="text-muted-foreground">
            Track your crypto portfolio, convert currencies in real-time, and monitor market trends.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-finance-highlight">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-finance-highlight">
              {formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{formatCurrency(totalPnL)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">P&L Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{pnlPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency Converter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Amount</Label>
              <Input type="number" defaultValue="1000" placeholder="Enter amount" />
            </div>
            <div>
              <Label>From</Label>
              <Select defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To</Label>
              <Select defaultValue="INR">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCurrencyConversion}>
              Convert
            </Button>
          </div>
          
          {conversionResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span>{conversionResult.amount} {conversionResult.from}</span>
                <span>=</span>
                <span className="font-bold">{formatCurrency(conversionResult.result)} {conversionResult.to}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Rate: 1 {conversionResult.from} = {conversionResult.rate} {conversionResult.to}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crypto Portfolio */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Crypto Portfolio</CardTitle>
              <CardDescription>Your cryptocurrency holdings and performance</CardDescription>
            </div>
            <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Crypto Asset</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleAddAsset)} className="space-y-4">
                  <div>
                    <Label>Symbol</Label>
                    <Input {...register('symbol', { required: true })} placeholder="BTC, ETH, etc." />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input {...register('name', { required: true })} placeholder="Bitcoin, Ethereum, etc." />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" step="0.00000001" {...register('quantity', { required: true })} />
                  </div>
                  <div>
                    <Label>Average Buy Price</Label>
                    <Input type="number" step="0.01" {...register('avgPrice', { required: true })} />
                  </div>
                  <div>
                    <Label>Current Price (Optional)</Label>
                    <Input type="number" step="0.01" {...register('currentPrice')} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowAddAsset(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Asset</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => {
              const metrics = calculateAssetMetrics(asset);
              
              return (
                <div key={asset.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{asset.symbol}</h3>
                        <Badge variant="outline">{asset.name}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {asset.quantity.toLocaleString()} {asset.symbol}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Avg: {formatCurrency(asset.avgPrice)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAsset(asset.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Price</p>
                      <p className="font-medium">{formatCurrency(asset.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Market Value</p>
                      <p className="font-medium">{formatCurrency(metrics.marketValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L</p>
                      <p className="font-medium text-green-600">
                        +{formatCurrency(metrics.pnl)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L %</p>
                      <p className="font-medium text-green-600">
                        +{metrics.pnlPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Markets;
