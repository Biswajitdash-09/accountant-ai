
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_base: boolean;
  updated_at: string;
}

export const useCurrencies = () => {
  const {
    data: currencies = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;
      return data as Currency[];
    },
  });

  const baseCurrency = currencies.find(c => c.is_base);

  const convertAmount = (amount: number, fromCurrencyId: string, toCurrencyId: string) => {
    if (fromCurrencyId === toCurrencyId) return amount;
    
    const fromCurrency = currencies.find(c => c.id === fromCurrencyId);
    const toCurrency = currencies.find(c => c.id === toCurrencyId);
    
    if (!fromCurrency || !toCurrency) return amount;
    
    // Convert to base currency first, then to target currency
    const baseAmount = amount / fromCurrency.exchange_rate;
    return baseAmount * toCurrency.exchange_rate;
  };

  return {
    currencies,
    baseCurrency,
    convertAmount,
    isLoading,
    error,
  };
};
