
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Bitcoin } from "lucide-react";
import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Markets = () => {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-8 max-w-7xl animate-fade-in">
      <div className="space-y-2 sm:space-y-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
          <span>Markets & Portfolio</span>
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
          Track your crypto portfolio, convert currencies in real-time, and monitor market trends.
        </p>
      </div>

      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className={cn(
          "grid w-full grid-cols-2 h-auto mb-6",
          isMobile ? "h-16" : "h-12"
        )}>
          <TabsTrigger 
            value="crypto" 
            className={cn(
              "flex gap-1 sm:gap-2 hover-scale transition-all duration-200",
              isMobile ? "flex-col py-3 px-2" : "flex-row py-3 px-4"
            )}
          >
            <Bitcoin className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              {isMobile ? "Portfolio" : "Crypto Portfolio"}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="currency" 
            className={cn(
              "flex gap-1 sm:gap-2 hover-scale transition-all duration-200",
              isMobile ? "flex-col py-3 px-2" : "flex-row py-3 px-4"
            )}
          >
            <DollarSign className="h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              {isMobile ? "Converter" : "Currency Converter"}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6 mt-6 animate-scale-in">
          <CryptoPortfolio />
        </TabsContent>

        <TabsContent value="currency" className="space-y-6 mt-6 animate-scale-in">
          <CurrencyConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Markets;
