
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Loader2 } from "lucide-react";

interface CurrencySelectorProps {
  label?: string;
  placeholder?: string;
}

const CurrencySelector = ({ 
  label = "Default Currency", 
  placeholder = "Select currency..." 
}: CurrencySelectorProps) => {
  const { currencies, isLoading: currenciesLoading } = useCurrencies();
  const { preferences, updatePreferences } = useUserPreferences();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCurrencyChange = async (currencyId: string) => {
    setIsUpdating(true);
    try {
      await updatePreferences.mutateAsync({
        default_currency_id: currencyId
      });
    } catch (error) {
      console.error('Failed to update currency:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (currenciesLoading) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2 h-10 px-3 py-2 border border-input bg-background rounded-md">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading currencies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="currency-selector">{label}</Label>
      <div className="relative">
        <Select
          value={preferences?.default_currency_id || ""}
          onValueChange={handleCurrencyChange}
          disabled={isUpdating}
        >
          <SelectTrigger id="currency-selector">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.id} value={currency.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currency.symbol}</span>
                  <span>{currency.name}</span>
                  <span className="text-sm text-muted-foreground">({currency.code})</span>
                  {currency.is_base && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Base
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isUpdating && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencySelector;
