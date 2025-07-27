import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Plus, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MobileForm, MobileFormSection, MobileFormRow } from '@/components/ui/mobile-form';
import { useIsMobile } from '@/hooks/use-mobile';

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

  const totalValue = assets.reduce((sum, asset) => sum + Math.abs(asset.market_value || 0), 0);
  const totalPnL = assets.reduce((sum, asset) => sum + (asset.pnl || 0), 0);
  const totalPnLPercentage = totalValue > 0 ? (totalPnL / (totalValue - Math.abs(totalPnL))) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl">Crypto Portfolio</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshPrices}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''} ${isMobile ? '' : 'mr-2'}`} />
              {!isMobile && 'Refresh'}
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full sm:w-auto"
            >
              <Plus className={`h-4 w-4 ${isMobile ? '' : 'mr-2'}`} />
              {!isMobile && 'Add Asset'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Portfolio Summary - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl sm:text-2xl font-bold">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">Total P&L</p>
              <p className={`text-xl sm:text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}₹{Math.abs(totalPnL).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">P&L Percentage</p>
              <div className="flex items-center justify-center gap-1">
                {totalPnLPercentage >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-xl sm:text-2xl font-bold ${totalPnLPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnLPercentage >= 0 ? '+' : ''}{Math.abs(totalPnLPercentage).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Add Asset Form - Mobile Optimized */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Add New Asset</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <MobileForm>
                  <MobileFormSection title="">
                    <MobileFormRow>
                      <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium">Crypto</label>
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
                      </div>
                    </MobileFormRow>
                    
                    <MobileFormRow>
                      <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                          placeholder="0.00000001"
                          type="number"
                          step="0.00000001"
                          value={newAsset.quantity}
                          onChange={(e) => setNewAsset({ ...newAsset, quantity: e.target.value })}
                        />
                      </div>
                    </MobileFormRow>
                    
                    <MobileFormRow>
                      <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium">Avg Buy Price (INR)</label>
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={newAsset.avgBuyPrice}
                          onChange={(e) => setNewAsset({ ...newAsset, avgBuyPrice: e.target.value })}
                        />
                      </div>
                    </MobileFormRow>
                    
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button onClick={addAsset} className="flex-1">Add Asset</Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </MobileFormSection>
                </MobileForm>
              </CardContent>
            </Card>
          )}

          {/* Assets List */}
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
                <Card key={asset.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-base font-bold px-2 py-1">
                          {asset.symbol}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">
                            {asset.quantity.toFixed(8)} {asset.symbol}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                    
                    {/* Mobile-first grid layout */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Current Price</p>
                        <p className="font-semibold">
                          ₹{(asset.current_price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Market Value</p>
                        <p className="font-semibold">
                          ₹{Math.abs(asset.market_value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">P&L</p>
                        <p className={`font-semibold ${(asset.pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(asset.pnl || 0) >= 0 ? '+' : ''}₹{Math.abs(asset.pnl || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">P&L %</p>
                        <div className="flex items-center gap-1">
                          {(asset.pnl_percentage || 0) >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <p className={`font-semibold text-sm ${(asset.pnl_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(asset.pnl_percentage || 0) >= 0 ? '+' : ''}{Math.abs(asset.pnl_percentage || 0).toFixed(2)}%
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
