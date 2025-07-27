
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Plus, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MobileForm, MobileFormSection, MobileFormRow } from '@/components/ui/mobile-form';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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

interface CryptoPrice {
  symbol: string;
  price: number;
  fetched_at: string;
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
  const isMobile = useIsMobile();

  const fetchPortfolio = async () => {
    if (!user) return;

    try {
      console.log('Fetching crypto portfolio...');
      
      // Use RPC function to get crypto assets
      const { data: portfolioData, error: portfolioError } = await supabase
        .rpc('get_user_crypto_assets', { p_user_id: user.id });

      if (portfolioError) {
        console.warn('RPC call failed, trying direct table query:', portfolioError);
        
        // Fallback to direct table query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('crypto_assets')
          .select('*')
          .eq('user_id', user.id);
        
        if (fallbackError) throw fallbackError;
        
        const enrichedAssets = (fallbackData || []).map((asset: any) => ({
          ...asset,
          current_price: 0,
          market_value: 0,
          pnl: 0,
          pnl_percentage: 0
        }));
        
        setAssets(enrichedAssets);
        return;
      }

      // Fetch current prices for symbols
      const symbols = (portfolioData || []).map((asset: any) => asset.symbol);
      if (symbols.length > 0) {
        const { data: pricesData } = await supabase
          .from('crypto_prices')
          .select('symbol, price, fetched_at')
          .in('symbol', symbols)
          .order('fetched_at', { ascending: false });

        // Get latest price for each symbol
        const latestPrices: Record<string, number> = {};
        (pricesData || []).forEach((price: CryptoPrice) => {
          if (!latestPrices[price.symbol]) {
            latestPrices[price.symbol] = price.price;
          }
        });

        // Calculate portfolio metrics
        const enrichedAssets = (portfolioData || []).map((asset: any) => {
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
        });

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
  const totalCostBasis = totalValue - totalPnL;
  const totalPnLPercentage = totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="card-hover">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl">Crypto Portfolio</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshPrices}
                disabled={isRefreshing}
                className={cn(
                  "button-hover transition-all duration-200 cursor-pointer",
                  isMobile ? "w-full" : "w-auto"
                )}
              >
                <RefreshCw className={cn(
                  "h-4 w-4",
                  isRefreshing && "animate-spin",
                  !isMobile && "mr-2"
                )} />
                {!isMobile && "Refresh"}
              </Button>
              <Button 
                size="sm" 
                onClick={() => setShowAddForm(!showAddForm)}
                className={cn(
                  "button-hover transition-all duration-200 cursor-pointer",
                  isMobile ? "w-full" : "w-auto"
                )}
              >
                <Plus className={cn("h-4 w-4", !isMobile && "mr-2")} />
                {!isMobile && "Add Asset"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Portfolio Summary - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg hover-glow transition-all duration-200 cursor-pointer">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Value</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">
                ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg hover-glow transition-all duration-200 cursor-pointer">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total P&L</p>
              <p className={cn(
                "text-lg sm:text-xl lg:text-2xl font-bold",
                totalPnL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}>
                {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg hover-glow transition-all duration-200 cursor-pointer">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">P&L Percentage</p>
              <div className="flex items-center justify-center gap-1">
                {totalPnLPercentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <p className={cn(
                  "text-lg sm:text-xl lg:text-2xl font-bold",
                  totalPnLPercentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Add Asset Form - Mobile Optimized */}
          {showAddForm && (
            <Card className="border-2 border-dashed border-primary/20 animate-scale-in">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base sm:text-lg">Add New Asset</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="hover-scale transition-all duration-200 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cryptocurrency</label>
                    <Select onValueChange={(value) => setNewAsset({ ...newAsset, symbol: value })}>
                      <SelectTrigger className="focus-ring transition-all duration-200 cursor-pointer">
                        <SelectValue placeholder="Select crypto" />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_CRYPTOS.map(crypto => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol} className="cursor-pointer">
                            {crypto.symbol} - {crypto.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantity</label>
                      <Input
                        placeholder="0.00000001"
                        type="number"
                        step="0.00000001"
                        value={newAsset.quantity}
                        onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                        className="focus-ring transition-all duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Avg Buy Price (INR)</label>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        value={newAsset.avgBuyPrice}
                        onChange={(e) => setNewAsset({ ...newAsset, avgBuyPrice: e.target.value })}
                        className="focus-ring transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <Button onClick={addAsset} className="flex-1 button-hover transition-all duration-200 cursor-pointer">
                      Add Asset
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 button-hover transition-all duration-200 cursor-pointer">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assets List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading portfolio...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-4">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium mb-2">No crypto assets in your portfolio</p>
              <p className="text-sm">Add your first asset to get started tracking your investments</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {assets.map((asset) => (
                <Card key={asset.id} className="border card-hover transition-all duration-200">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Badge variant="outline" className="text-sm font-bold px-3 py-1 hover-scale transition-all duration-200 cursor-pointer">
                          {asset.symbol}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">
                            {asset.quantity.toFixed(8)} {asset.symbol}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Avg: ₹{asset.avg_buy_price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeAsset(asset.id)}
                        className="hover-scale shrink-0 transition-all duration-200 cursor-pointer"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    {/* Mobile-first grid layout */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Current Price</p>
                        <p className="font-semibold">
                          ₹{(asset.current_price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Market Value</p>
                        <p className="font-semibold">
                          ₹{(asset.market_value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">P&L</p>
                        <p className={cn(
                          "font-semibold",
                          (asset.pnl || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}>
                          {(asset.pnl || 0) >= 0 ? '+' : ''}₹{(asset.pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">P&L %</p>
                        <div className="flex items-center gap-1">
                          {(asset.pnl_percentage || 0) >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          )}
                          <p className={cn(
                            "font-semibold text-sm",
                            (asset.pnl_percentage || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          )}>
                            {(asset.pnl_percentage || 0) >= 0 ? '+' : ''}{(asset.pnl_percentage || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
