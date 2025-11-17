import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface CurrencyConversion {
  code: string;
  symbol: string;
  amount: number;
}

export const useMultiCurrencyDisplay = (baseAmount: number) => {
  const { selectedCurrency } = useCurrency();
  const [conversions, setConversions] = useState<CurrencyConversion[]>([]);

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .order("code");

      if (error) throw error;
      return data;
    },
  });

  const { data: exchangeRates } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exchange_rates")
        .select("*, base_currency:currencies!exchange_rates_base_currency_id_fkey(code), target_currency:currencies!exchange_rates_target_currency_id_fkey(code)")
        .order("rate_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!currencies || !exchangeRates || !selectedCurrency) return;

    // Find the base currency (usually USD)
    const baseCurrency = currencies.find(c => c.is_base);
    if (!baseCurrency) return;

    // Get the exchange rate from selected currency to base currency
    const selectedToBase = exchangeRates.find(
      r => r.base_currency.code === selectedCurrency.code && r.target_currency.code === baseCurrency.code
    )?.rate || 1;

    // Convert the amount to base currency first
    const amountInBase = baseAmount * selectedToBase;

    // Popular currencies to display
    const popularCurrencies = ["USD", "EUR", "GBP", "NGN", "INR"];
    
    const newConversions: CurrencyConversion[] = [];

    popularCurrencies.forEach(currencyCode => {
      if (currencyCode === selectedCurrency.code) return; // Skip selected currency

      const currency = currencies.find(c => c.code === currencyCode);
      if (!currency) return;

      // Get exchange rate from base to target
      const baseToTarget = exchangeRates.find(
        r => r.base_currency.code === baseCurrency.code && r.target_currency.code === currencyCode
      )?.rate || 1;

      const convertedAmount = amountInBase / baseToTarget;

      newConversions.push({
        code: currency.code,
        symbol: currency.symbol,
        amount: convertedAmount,
      });
    });

    setConversions(newConversions);
  }, [baseAmount, currencies, exchangeRates, selectedCurrency]);

  return {
    conversions,
    selectedCurrency,
  };
};
