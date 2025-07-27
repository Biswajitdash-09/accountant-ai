import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, RefreshCw, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileForm, MobileFormSection, MobileFormRow } from '@/components/ui/mobile-form';

interface ExchangeRate {
  base: string;
  quote: string;
  rate: number;
  fetched_at: string;
}

const POPULAR_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
];

export const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const fetchExchangeRates = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setExchangeRates(data || []);
      
      if (data && data.length > 0) {
        setLastUpdated(new Date(data[0].fetched_at).toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates",
        variant: "destructive",
      });
    }
  };

  const refreshRates = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('sync-fx', {
        body: { currencies: [fromCurrency, toCurrency] }
      });

      if (error) {
        console.warn('FX sync trigger failed:', error);
      }

      // Refresh rates after a short delay
      setTimeout(() => {
        fetchExchangeRates();
      }, 2000);

      toast({
        title: "Success",
        description: "Exchange rates updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh exchange rates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExchangeRate = (from: string, to: string): number => {
    if (from === to) return 1;

    // Direct rate
    const directRate = exchangeRates.find(
      rate => rate.base === from && rate.quote === to
    );
    if (directRate) return directRate.rate;

    // Inverse rate
    const inverseRate = exchangeRates.find(
      rate => rate.base === to && rate.quote === from
    );
    if (inverseRate) return 1 / inverseRate.rate;

    // Cross rate via USD
    const fromToUSD = exchangeRates.find(
      rate => rate.base === from && rate.quote === 'USD'
    );
    const usdToTarget = exchangeRates.find(
      rate => rate.base === 'USD' && rate.quote === to
    );

    if (fromToUSD && usdToTarget) {
      return fromToUSD.rate * usdToTarget.rate;
    }

    // Cross rate via INR
    const fromToINR = exchangeRates.find(
      rate => rate.base === from && rate.quote === 'INR'
    );
    const inrToTarget = exchangeRates.find(
      rate => rate.base === 'INR' && rate.quote === to
    );

    if (fromToINR && inrToTarget) {
      return fromToINR.rate * inrToTarget.rate;
    }

    return 0; // No rate available
  };

  const convertCurrency = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setConvertedAmount(null);
      return;
    }

    const rate = getExchangeRate(fromCurrency, toCurrency);
    if (rate > 0) {
      setConvertedAmount(numAmount * rate);
    } else {
      setConvertedAmount(null);
      toast({
        title: "Error",
        description: "Exchange rate not available for this currency pair",
        variant: "destructive",
      });
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency && exchangeRates.length > 0) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency, exchangeRates]);

  const fromCurrencyInfo = POPULAR_CURRENCIES.find(c => c.code === fromCurrency);
  const toCurrencyInfo = POPULAR_CURRENCIES.find(c => c.code === toCurrency);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <CardTitle className="text-lg sm:text-xl">Currency Converter</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshRates}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''} ${isMobile ? '' : 'mr-2'}`} />
          {!isMobile && 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <MobileForm>
          <MobileFormSection title="">
            {/* From Currency Section */}
            <MobileFormRow>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">From</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-1"
                  />
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_CURRENCIES.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </MobileFormRow>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="rounded-full"
              >
                {isMobile ? (
                  <ArrowUpDown className="h-4 w-4" />
                ) : (
                  <ArrowRightLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* To Currency Section */}
            <MobileFormRow>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">To</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={convertedAmount !== null ? Math.abs(convertedAmount).toFixed(4) : ''}
                    readOnly
                    placeholder="Converted amount"
                    className="flex-1 bg-muted"
                  />
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_CURRENCIES.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </MobileFormRow>
          </MobileFormSection>
        </MobileForm>

        {convertedAmount !== null && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-lg sm:text-2xl font-bold">
                {fromCurrencyInfo?.symbol}{amount} {fromCurrency} = {toCurrencyInfo?.symbol}{Math.abs(convertedAmount).toFixed(2)} {toCurrency}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                1 {fromCurrency} = {toCurrencyInfo?.symbol}{Math.abs(getExchangeRate(fromCurrency, toCurrency)).toFixed(4)} {toCurrency}
              </p>
            </div>
          </div>
        )}

        {lastUpdated && (
          <p className="text-xs text-muted-foreground text-center">
            Exchange rates last updated: {lastUpdated}
          </p>
        )}

        {/* Popular Exchange Rates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-xs mb-1">USD/INR</p>
            <p className="font-semibold">{Math.abs(getExchangeRate('USD', 'INR')).toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-xs mb-1">EUR/INR</p>
            <p className="font-semibold">{Math.abs(getExchangeRate('EUR', 'INR')).toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-xs mb-1">GBP/INR</p>
            <p className="font-semibold">{Math.abs(getExchangeRate('GBP', 'INR')).toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-xs mb-1">JPY/INR</p>
            <p className="font-semibold">{Math.abs(getExchangeRate('JPY', 'INR')).toFixed(4)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
