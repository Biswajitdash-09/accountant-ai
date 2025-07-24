
import { useMemo } from "react";
import { useCurrencies } from "./useCurrencies";

export const useCurrencyFormatter = () => {
  const { currencies, baseCurrency, convertAmount } = useCurrencies();

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

      // Default to base currency if no specific currency is provided
      const targetCurrencyId = toCurrencyId || baseCurrency?.id;
      const sourceCurrencyId = fromCurrencyId || baseCurrency?.id;

      if (!targetCurrencyId || !sourceCurrencyId) {
        return amount.toFixed(decimals);
      }

      // Convert amount if needed
      const convertedAmount = convertAmount(amount, sourceCurrencyId, targetCurrencyId);
      const targetCurrency = currencies.find(c => c.id === targetCurrencyId);

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
  }, [currencies, baseCurrency, convertAmount]);

  return {
    formatCurrency,
    currencies,
    baseCurrency,
  };
};
