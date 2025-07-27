
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, Bitcoin } from "lucide-react";
import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import { CurrencyConverter } from "@/components/CurrencyConverter";

const Markets = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Markets & Portfolio Tracking
        </h1>
        <p className="text-muted-foreground">
          Track your crypto portfolio, convert currencies in real-time, and monitor market trends.
        </p>
      </div>

      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crypto" className="gap-2">
            <Bitcoin className="h-4 w-4" />
            Crypto Portfolio
          </TabsTrigger>
          <TabsTrigger value="currency" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Currency Converter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6">
          <CryptoPortfolio />
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <CurrencyConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Markets;
