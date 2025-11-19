
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
}

interface CurrencyContextProps {
  selectedCurrency: Currency | null;
  currencies: Currency[];
  loading: boolean;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number, fromCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextProps>({
  selectedCurrency: null,
  currencies: [],
  loading: true,
  setCurrency: () => {},
  formatAmount: () => "",
});

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  // Load currencies from database
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const { data, error } = await supabase
          .from('currencies')
          .select('*')
          .order('code', { ascending: true });

        if (error) throw error;
        setCurrencies(data || []);
        
        // Set default currency (USD fallback)
        if (data && data.length > 0 && !selectedCurrency) {
          const defaultCurrency = data.find(c => c.code === 'USD') || data[0];
          setSelectedCurrency(defaultCurrency);
        }
      } catch (error) {
        console.error('Error loading currencies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, []);

  // Auto-detect user currency based on location
  useEffect(() => {
    const detectCurrency = async () => {
      if (!user || currencies.length === 0) return;

      try {
        // Check if user has saved location
        const { data: locationData } = await supabase
          .from('user_locations')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (locationData) {
          const currency = currencies.find(c => c.code === locationData.currency.toUpperCase());
          if (currency) {
            setSelectedCurrency(currency);
            return;
          }
        }

        // Detect based on IP if no saved location
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          
          let currencyCode = 'USD'; // Default
          if (data.country_code === 'IN') currencyCode = 'INR';
          else if (data.country_code === 'NG') currencyCode = 'NGN';
          
          const detectedCurrency = currencies.find(c => c.code === currencyCode);
          if (detectedCurrency) {
            setSelectedCurrency(detectedCurrency);
            
            // Save location for future use
            await supabase.from('user_locations').upsert({
              user_id: user.id,
              country_code: data.country_code || 'US',
              country_name: data.country_name || 'United States',
              currency: currencyCode.toLowerCase(),
              detected_from_ip: true
            });
          }
        } catch (ipError) {
          console.error('IP detection failed:', ipError);
        }
      } catch (error) {
        console.error('Error detecting currency:', error);
      }
    };

    detectCurrency();
  }, [user, currencies]);

  const setCurrency = async (currency: Currency) => {
    const previousCurrency = selectedCurrency;
    setSelectedCurrency(currency);
    
    // Invalidate all queries to refresh data with new currency
    queryClient.invalidateQueries();
    
    // Show success toast
    toast({
      title: "Currency Updated",
      description: `Currency changed to ${currency.name} (${currency.code})`,
    });
    
    // Save user preference if logged in
    if (user) {
      try {
        await supabase.from('user_locations').upsert({
          user_id: user.id,
          country_code: currency.code === 'INR' ? 'IN' : currency.code === 'NGN' ? 'NG' : 'US',
          country_name: currency.code === 'INR' ? 'India' : currency.code === 'NGN' ? 'Nigeria' : 'United States',
          currency: currency.code.toLowerCase(),
          detected_from_ip: false
        });
      } catch (error) {
        console.error('Error saving currency preference:', error);
        // Revert on error
        setSelectedCurrency(previousCurrency);
        toast({
          title: "Error",
          description: "Failed to save currency preference",
          variant: "destructive",
        });
      }
    }
  };

  const formatAmount = (amount: number, fromCurrency: string = 'USD') => {
    if (!selectedCurrency) return `$${amount.toFixed(2)}`;
    
    let convertedAmount = amount;
    
    // Convert from base currency to selected currency
    if (fromCurrency !== selectedCurrency.code) {
      const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
      if (fromCurrencyData) {
        // Convert to USD first, then to target currency
        const usdAmount = amount / fromCurrencyData.exchange_rate;
        convertedAmount = usdAmount * selectedCurrency.exchange_rate;
      }
    }
    
    return `${selectedCurrency.symbol}${convertedAmount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      currencies,
      loading,
      setCurrency,
      formatAmount
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
