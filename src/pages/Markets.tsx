
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Bitcoin } from "lucide-react";
import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { useIsMobile } from "@/hooks/use-mobile";

const Markets = () => {
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl">
      <div className="space-y-2 sm:space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className={isMobile ? "text-xl" : ""}>Markets & Portfolio</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track your crypto portfolio, convert currencies in real-time, and monitor market trends.
        </p>
      </div>

      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="crypto" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
            <Bitcoin className="h-4 w-4" />
            <span className="text-xs sm:text-sm">
              {isMobile ? "Portfolio" : "Crypto Portfolio"}
            </span>
          </TabsTrigger>
          <TabsTrigger value="currency" className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs sm:text-sm">
              {isMobile ? "Converter" : "Currency Converter"}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6 mt-6">
          <CryptoPortfolio />
        </TabsContent>

        <TabsContent value="currency" className="space-y-6 mt-6">
          <CurrencyConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Markets;
