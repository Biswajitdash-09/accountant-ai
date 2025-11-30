
import { CreditCard, Clock } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CreditBalanceProps {
  className?: string;
  showBuyButton?: boolean;
}

const CreditBalance = ({ className, showBuyButton = true }: CreditBalanceProps) => {
  const { availableCredits, dailyCreditsRemaining, isLoading } = useCredits();
  const { selectedCurrency } = useCurrency();
  const navigate = useNavigate();
  const [timeUntilReset, setTimeUntilReset] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilReset(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full cursor-help">
              <CreditCard className="h-4 w-4 text-primary" />
              <div className="flex items-center gap-1">
                <Badge 
                  variant={availableCredits > 5 ? "default" : availableCredits > 0 ? "secondary" : "destructive"} 
                  className="text-xs"
                >
                  {availableCredits} Credits
                </Badge>
                {dailyCreditsRemaining > 0 && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeUntilReset}
                  </Badge>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-semibold">Credits Information</p>
              <p>Available: {availableCredits} credits</p>
              {dailyCreditsRemaining > 0 && (
                <p>Daily free credits reset in: {timeUntilReset}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showBuyButton && availableCredits <= 5 && (
        <Button
          size="sm"
          variant={availableCredits === 0 ? "default" : "outline"}
          onClick={handleBuyCredits}
          className="h-8 text-xs"
        >
          {availableCredits === 0 ? "Buy Now" : "Buy Credits"}
        </Button>
      )}
    </div>
  );
};

export default CreditBalance;
