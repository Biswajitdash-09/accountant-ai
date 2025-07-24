
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useNotificationService } from "@/hooks/useNotificationService";

export const CurrencySelector = () => {
  const { currencies } = useCurrencies();
  const { preferences, updatePreferences } = useUserPreferences();
  const { createNotification } = useNotificationService();

  const handleCurrencyChange = async (currencyId: string) => {
    const selectedCurrency = currencies.find(c => c.id === currencyId);
    
    try {
      await updatePreferences.mutateAsync({ default_currency_id: currencyId });
      
      // Create notification about currency change
      if (selectedCurrency) {
        await createNotification(
          'Currency Updated',
          `Your default currency has been changed to ${selectedCurrency.name} (${selectedCurrency.code}). All financial data will now be displayed in this currency.`,
          'system',
          'medium'
        );
      }
    } catch (error) {
      console.error('Error updating currency:', error);
    }
  };

  const selectedCurrency = currencies.find(c => c.id === preferences?.default_currency_id);

  return (
    <div className="flex items-center gap-2">
      <Select value={preferences?.default_currency_id || ""} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Currency">
            {selectedCurrency ? (
              <span className="flex items-center gap-1">
                {selectedCurrency.symbol} {selectedCurrency.code}
              </span>
            ) : (
              "Select"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {currencies.map((currency) => (
            <SelectItem key={currency.id} value={currency.id}>
              <span className="flex items-center gap-2">
                {currency.symbol} {currency.code} - {currency.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
