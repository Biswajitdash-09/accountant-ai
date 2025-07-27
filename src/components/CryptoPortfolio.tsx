
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CryptoAsset {
  id: string;
  symbol: string;
  quantity: number;
  avg_buy_price: number;
  current_price?: number;
  market_value?: number;
  pnl?: number;
  pnl_percentage?: number;
}

const POPULAR_CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'LINK', name: 'Chainlink' }
];

export const CryptoPortfolio = () => {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    quantity: '',
    avgBuyPrice: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPortfolio = async () => {
    if (!user) return;

    try {
      const { data: portfolioData, error } = await supabase
        .from('crypto_assets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch current prices
      const symbols = portfolioData?.map(asset => asset.symbol) || [];
      if (symbols.length > 0) {
        const { data: pricesData } = await supabase
          .from('crypto_prices')
          .select('symbol, price, fetched_at')
          .in('symbol', symbols)
          .order('fetched_at', { ascending: false });

        // Get latest price for each symbol
        const latestPrices = pricesData?.reduce((acc, price) => {
          if (!acc[price.symbol]) {
            acc[price.symbol] = price.price;
          }
          return acc;
        }, {} as Record<string, number>) || {};

        // Calculate portfolio metrics
        const enrichedAssets = portfolioData?.map(asset => {
          const currentPrice = latestPrices[asset.symbol] || 0;
          const marketValue = asset.quantity * currentPrice;
          const costBasis = asset.quantity * asset.avg_buy_price;
          const pnl = marketValue - costBasis;
          const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

          return {
            ...asset,
            current_price: currentPrice,
            market_value: marketValue,
            pnl,
            pnl_percentage: pnlPercentage
          };
        }) || [];

        setAssets(enrichedAssets);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to fetch crypto portfolio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPrices = async () => {
    setIsRefreshing(true);
    try {
      // Trigger price sync
      const { error } = await supabase.functions.invoke('sync-crypto', {
        body: { symbols: assets.map(a => a.symbol) }
      });

      if (error) {
        console.warn('Price sync trigger failed:', error);
      }

      // Refresh portfolio after a short delay
      setTimeout(() => {
        fetchPortfolio();
      }, 2000);

      toast({
        title: "Success",
        description: "Crypto prices updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh prices",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const addAsset = async () => {
    if (!user || !newAsset.symbol || !newAsset.quantity || !newAsset.avgBuyPrice) return;

    try {
      const { error } = await supabase
        .from('crypto_assets')
        .insert([{
          user_id: user.id,
          symbol: newAsset.symbol.toUpperCase(),
          quantity: parseFloat(newAsset.quantity),
          avg_buy_price: parseFloat(newAsset.avgBuyPrice)
        }]);

      if (error) throw error;

      setNewAsset({ symbol: '', quantity: '', avgBuyPrice: '' });
      setShowAddForm(false);
      fetchPortfolio();

      toast({
        title: "Success",
        description: "Crypto asset added to portfolio",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add crypto asset",
        variant: "destructive",
      });
    }
  };

  const removeAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('crypto_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      fetchPortfolio();
      toast({
        title: "Success",
        description: "Asset removed from portfolio",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove asset",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  const totalValue = assets.reduce((sum, asset) => sum + (asset.market_value || 0), 0);
  const totalPnL = assets.reduce((sum, asset) => sum + (asset.pnl || 0), 0);
  const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Crypto Portfolio</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshPrices}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">P&L Percentage</p>
              <div className="flex items-center justify-center gap-1">
                {totalPnLPercentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-2xl font-bold ${totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Asset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select onValueChange={(value) => setNewAsset({ ...newAsset, symbol: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crypto" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_CRYPTOS.map(crypto => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.symbol} - {crypto.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Quantity"
                    type="number"
                    step="0.00000001"
                    value={newAsset.quantity}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                  />
                  <Input
                    placeholder="Avg Buy Price (INR)"
                    type="number"
                    step="0.01"
                    value={newAsset.avgBuyPrice}
                    onChange={(e) => setNewAsset({ ...newAsset, avgBuyPrice: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={addAsset}>Add Asset</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-8">Loading portfolio...</div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No crypto assets in your portfolio</p>
              <p className="text-sm">Add your first asset to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-lg font-bold">
                        {asset.symbol}
                      </Badge>
                      <div>
                        <p className="font-medium">
                          {asset.quantity.toFixed(8)} {asset.symbol}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg: ₹{asset.avg_buy_price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeAsset(asset.id)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current Price</p>
                      <p className="font-semibold">
                        ₹{(asset.current_price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Market Value</p>
                      <p className="font-semibold">
                        ₹{(asset.market_value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L</p>
                      <p className={`font-semibold ${(asset.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(asset.pnl || 0) >= 0 ? '+' : ''}₹{(asset.pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L %</p>
                      <div className="flex items-center gap-1">
                        {(asset.pnl_percentage || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <p className={`font-semibold ${(asset.pnl_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(asset.pnl_percentage || 0) >= 0 ? '+' : ''}{(asset.pnl_percentage || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
