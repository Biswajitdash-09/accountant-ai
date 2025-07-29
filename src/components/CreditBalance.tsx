
import { CreditCard } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CreditBalanceProps {
  className?: string;
  showBuyButton?: boolean;
}

const CreditBalance = ({ className, showBuyButton = true }: CreditBalanceProps) => {
  const { availableCredits, dailyCreditsRemaining, isLoading } = useCredits();
  const { selectedCurrency } = useCurrency();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <CreditCard className="h-4 w-4" />
        Loading...
      </div>
    );
  }

  const handleBuyCredits = () => {
    navigate('/pricing');
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
        <CreditCard className="h-4 w-4 text-primary" />
        <div className="flex items-center gap-1">
          <Badge 
            variant={availableCredits > 0 ? "default" : "destructive"} 
            className="text-xs"
          >
            {availableCredits} Credits
          </Badge>
          {dailyCreditsRemaining > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{dailyCreditsRemaining} Daily
            </Badge>
          )}
        </div>
      </div>
      
      {showBuyButton && availableCredits <= 2 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleBuyCredits}
          className="h-8 text-xs"
        >
          Buy Credits
        </Button>
      )}
    </div>
  );
};

export default CreditBalance;
