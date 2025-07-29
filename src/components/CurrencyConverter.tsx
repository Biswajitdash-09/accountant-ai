
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, TrendingUp } from "lucide-react";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  
  const { currencies, isLoading } = useCurrencies();
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();

  // Set default currencies when currencies are loaded
  useEffect(() => {
    if (currencies.length > 0 && !fromCurrency && !toCurrency) {
      // Prioritize NGN and ZAR as defaults
      const ngn = currencies.find(c => c.code === 'NGN');
      const zar = currencies.find(c => c.code === 'ZAR');
      const usd = currencies.find(c => c.code === 'USD');
      
      setFromCurrency(ngn?.id || usd?.id || currencies[0]?.id || "");
      setToCurrency(zar?.id || usd?.id || currencies[1]?.id || "");
    }
  }, [currencies, fromCurrency, toCurrency]);

  // Get popular currencies with NGN and ZAR prioritized
  const popularCurrencies = React.useMemo(() => {
    if (!currencies.length) return [];
    
    const priority = ['NGN', 'ZAR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    const prioritized = [];
    const remaining = [];
    
    currencies.forEach(currency => {
      const priorityIndex = priority.indexOf(currency.code);
      if (priorityIndex !== -1) {
        prioritized[priorityIndex] = currency;
      } else {
        remaining.push(currency);
      }
    });
    
    return [...prioritized.filter(Boolean), ...remaining];
  }, [currencies]);

  const handleConvert = () => {
    if (!amount || !fromCurrency || !toCurrency) {
      toast({
        title: "Missing Information",
        description: "Please select both currencies and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number.",
        variant: "destructive",
      });
      return;
    }

    const fromCurrencyData = currencies.find(c => c.id === fromCurrency);
    const toCurrencyData = currencies.find(c => c.id === toCurrency);

    if (!fromCurrencyData || !toCurrencyData) {
      toast({
        title: "Currency Error",
        description: "Selected currencies are not available.",
        variant: "destructive",
      });
      return;
    }

    // Convert using exchange rates
    let converted;
    if (fromCurrency === toCurrency) {
      converted = numAmount;
    } else {
      // Convert from source currency to base currency (USD equivalent)
      const baseAmount = numAmount / fromCurrencyData.exchange_rate;
      // Convert from base currency to target currency
      converted = baseAmount * toCurrencyData.exchange_rate;
    }

    setConvertedAmount(converted);
    
    toast({
      title: "Conversion Complete",
      description: `${formatCurrency(numAmount, fromCurrency, fromCurrency)} = ${formatCurrency(converted, toCurrency, toCurrency)}`,
    });
  };

  const handleSwapCurrencies = () => {
    const tempFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempFrom);
    // Clear the result when swapping
    setConvertedAmount(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading currencies...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Currency Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {popularCurrencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-sm text-muted-foreground">
                        {currency.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {currency.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {popularCurrencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-sm text-muted-foreground">
                        {currency.symbol}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {currency.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwapCurrencies}
            className="gap-2"
            disabled={!fromCurrency || !toCurrency}
          >
            <ArrowUpDown className="h-4 w-4" />
            Swap
          </Button>
        </div>

        {/* Convert Button */}
        <Button onClick={handleConvert} className="w-full" disabled={!fromCurrency || !toCurrency}>
          Convert
        </Button>

        {/* Result */}
        {convertedAmount !== null && fromCurrency && toCurrency && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold">
                {formatCurrency(parseFloat(amount) || 0, fromCurrency, fromCurrency)}
              </div>
              <div className="text-sm text-muted-foreground">=</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(convertedAmount, toCurrency, toCurrency)}
              </div>
            </div>
          </div>
        )}

        {/* Exchange Rate Info */}
        {fromCurrency && toCurrency && fromCurrency !== toCurrency && (
          <div className="text-xs text-muted-foreground text-center">
            {(() => {
              const fromCurrencyData = currencies.find(c => c.id === fromCurrency);
              const toCurrencyData = currencies.find(c => c.id === toCurrency);
              if (!fromCurrencyData || !toCurrencyData) return null;
              
              const rate = toCurrencyData.exchange_rate / fromCurrencyData.exchange_rate;
              return `1 ${fromCurrencyData.code} = ${rate.toFixed(6)} ${toCurrencyData.code}`;
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
