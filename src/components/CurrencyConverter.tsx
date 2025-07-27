import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Currency Converter</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshRates}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">From</label>
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
                <SelectTrigger className="w-20">
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

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapCurrencies}
              className="rounded-full"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">To</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={convertedAmount !== null ? convertedAmount.toFixed(4) : ''}
                readOnly
                placeholder="Converted amount"
                className="flex-1"
              />
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-20">
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
        </div>

        {convertedAmount !== null && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {fromCurrencyInfo?.symbol}{amount} {fromCurrency} = {toCurrencyInfo?.symbol}{convertedAmount.toFixed(2)} {toCurrency}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                1 {fromCurrency} = {toCurrencyInfo?.symbol}{getExchangeRate(fromCurrency, toCurrency).toFixed(4)} {toCurrency}
              </p>
            </div>
          </div>
        )}

        {lastUpdated && (
          <p className="text-xs text-muted-foreground text-center">
            Exchange rates last updated: {lastUpdated}
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">USD/INR</p>
            <p className="font-semibold">{getExchangeRate('USD', 'INR').toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">EUR/INR</p>
            <p className="font-semibold">{getExchangeRate('EUR', 'INR').toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">GBP/INR</p>
            <p className="font-semibold">{getExchangeRate('GBP', 'INR').toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">JPY/INR</p>
            <p className="font-semibold">{getExchangeRate('JPY', 'INR').toFixed(4)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
