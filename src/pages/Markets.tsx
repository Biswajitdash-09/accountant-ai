import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import CurrencyConverter from "@/components/CurrencyConverter";
import { InvestmentPortfolio } from "@/components/InvestmentPortfolio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Markets = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Markets & Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and crypto portfolio</p>
        </div>
      </div>

      <Tabs defaultValue="crypto" className="w-full">
        <TabsList>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
        </TabsList>

        <TabsContent value="crypto">
          <CryptoPortfolio />
        </TabsContent>

        <TabsContent value="investments">
          <InvestmentPortfolio />
        </TabsContent>

        <TabsContent value="currency">
          <CurrencyConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Markets;
