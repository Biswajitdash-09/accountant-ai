import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMultiCurrencyDisplay } from "@/hooks/useMultiCurrencyDisplay";
import { Badge } from "@/components/ui/badge";

interface MultiCurrencyTooltipProps {
  amount: number;
  showIcon?: boolean;
}

export const MultiCurrencyTooltip = ({ amount, showIcon = true }: MultiCurrencyTooltipProps) => {
  const { conversions, selectedCurrency } = useMultiCurrencyDisplay(amount);

  if (conversions.length === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {showIcon ? (
            <Info className="h-3 w-3 text-muted-foreground cursor-help inline-block ml-1" />
          ) : (
            <span className="text-xs text-muted-foreground cursor-help hover:underline">
              (see conversions)
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="w-64">
          <div className="space-y-2">
            <p className="text-xs font-medium">
              {selectedCurrency?.symbol}{amount.toFixed(2)} {selectedCurrency?.code} equals:
            </p>
            <div className="space-y-1.5">
              {conversions.map((conversion) => (
                <div key={conversion.code} className="flex items-center justify-between text-xs">
                  <Badge variant="outline" className="text-xs">
                    {conversion.code}
                  </Badge>
                  <span className="font-medium">
                    {conversion.symbol}{conversion.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Exchange rates are updated regularly
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
