
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
import { useCurrency } from "@/contexts/CurrencyContext";

const CurrencySwitcher = () => {
  const [open, setOpen] = useState(false);
  const { selectedCurrency, currencies, loading, setCurrency } = useCurrency();

  if (loading) {
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
              {selectedCurrency ? `${selectedCurrency.symbol} ${selectedCurrency.code}` : "Select..."}
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
              {currencies.map((currency) => (
                <CommandItem
                  key={currency.id}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => {
                    setCurrency(currency);
                    setOpen(false);
                  }}
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
                        selectedCurrency?.id === currency.id
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

export default CurrencySwitcher;
