
import React, { useState } from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrencies } from "@/hooks/useCurrencies";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/components/ui/use-toast";

const CurrencySelector = () => {
  const [open, setOpen] = useState(false);
  const { currencies, isLoading } = useCurrencies();
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();

  // Get current currency or fallback to USD
  const currentCurrency = currencies.find(c => c.id === preferences?.default_currency_id) 
    || currencies.find(c => c.code === 'USD')
    || currencies[0];

  // Prioritize NGN, ZAR, and other major currencies
  const prioritizedCurrencies = React.useMemo(() => {
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
    
    return [...prioritized.filter(Boolean), ...remaining.sort((a, b) => a.code.localeCompare(b.code))];
  }, [currencies]);

  const handleCurrencyChange = async (currencyId: string) => {
    try {
      const selectedCurrency = currencies.find(c => c.id === currencyId);
      if (!selectedCurrency) return;

      await updatePreferences.mutateAsync({
        default_currency_id: currencyId
      });

      toast({
        title: "Currency Updated",
        description: `Default currency set to ${selectedCurrency.name} (${selectedCurrency.code})`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error updating currency:', error);
      toast({
        title: "Error",
        description: "Failed to update currency. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[140px] justify-between text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {currentCurrency ? currentCurrency.code : "Select..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search currency..." />
          <CommandEmpty>No currency found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {prioritizedCurrencies.map((currency) => (
                <CommandItem
                  key={currency.id}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => handleCurrencyChange(currency.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.code}</span>
                    <span className="text-sm text-muted-foreground truncate">
                      {currency.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {currency.symbol}
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentCurrency?.id === currency.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CurrencySelector;
