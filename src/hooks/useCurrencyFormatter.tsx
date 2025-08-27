
import { useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrencies } from "./useCurrencies";
import { useUserPreferences } from "./useUserPreferences";

export const useCurrencyFormatter = () => {
  const { currencies, baseCurrency, convertAmount } = useCurrencies();
  const { preferences } = useUserPreferences();
  const queryClient = useQueryClient();

  // Get the user's preferred currency or fallback to base currency
  const preferredCurrency = useMemo(() => {
    if (preferences?.default_currency_id) {
      return currencies.find(c => c.id === preferences.default_currency_id) || baseCurrency;
    }
    return baseCurrency;
  }, [currencies, baseCurrency, preferences]);

  // Invalidate related queries when currency changes
  useEffect(() => {
    if (preferredCurrency) {
      // Invalidate specific queries that contain financial data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['financial-goals'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  }, [preferredCurrency?.id, queryClient]);

  const formatCurrency = useMemo(() => {
    return (
      amount: number,
      fromCurrencyId?: string,
      toCurrencyId?: string,
      options?: {
        showSymbol?: boolean;
        showCode?: boolean;
        decimals?: number;
      }
    ) => {
      const {
        showSymbol = true,
        showCode = false,
        decimals = 2
      } = options || {};

      // Use preferred currency as default target
      const targetCurrencyId = toCurrencyId || preferredCurrency?.id;
      const sourceCurrencyId = fromCurrencyId || preferredCurrency?.id;

      // Handle null values - fallback to base currency
      const finalSourceCurrencyId = sourceCurrencyId || baseCurrency?.id;
      const finalTargetCurrencyId = targetCurrencyId || baseCurrency?.id;

      if (!finalTargetCurrencyId || !finalSourceCurrencyId) {
        return amount.toFixed(decimals);
      }

      // Convert amount if needed
      const convertedAmount = convertAmount(amount, finalSourceCurrencyId, finalTargetCurrencyId);
      const targetCurrency = currencies.find(c => c.id === finalTargetCurrencyId);

      if (!targetCurrency) {
        return convertedAmount.toFixed(decimals);
      }

      let formattedAmount = convertedAmount.toFixed(decimals);
      
      // Add thousand separators
      formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      let result = formattedAmount;
      
      if (showSymbol) {
        result = `${targetCurrency.symbol}${result}`;
      }
      
      if (showCode) {
        result = `${result} ${targetCurrency.code}`;
      }

      return result;
    };
  }, [currencies, preferredCurrency, baseCurrency, convertAmount]);

  return {
    formatCurrency,
    currencies,
    baseCurrency,
    preferredCurrency,
  };
};
