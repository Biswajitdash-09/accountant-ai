import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import CurrencyConverter from "@/components/CurrencyConverter";
import { InvestmentPortfolio } from "@/components/InvestmentPortfolio";
import { CryptoWalletConnect } from "@/components/crypto/CryptoWalletConnect";
import { CryptoPortfolioOverview } from "@/components/crypto/CryptoPortfolioOverview";
import { CryptoTransactionHistory } from "@/components/crypto/CryptoTransactionHistory";
import { NFTGallery } from "@/components/crypto/NFTGallery";
import { CryptoAnalyticsDashboard } from "@/components/crypto/CryptoAnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Bitcoin, DollarSign, Wallet, TrendingUp, Activity, Image } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="crypto">
            <Bitcoin className="h-4 w-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="wallet">
            <Wallet className="h-4 w-4 mr-2" />
            My Wallet
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Activity className="h-4 w-4 mr-2" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="nfts">
            <Image className="h-4 w-4 mr-2" />
            NFTs
          </TabsTrigger>
          <TabsTrigger value="currency">
            <DollarSign className="h-4 w-4 mr-2" />
            Converter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto">
          <CryptoPortfolio />
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <CryptoWalletConnect />
          <CryptoPortfolioOverview />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CryptoAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <CryptoTransactionHistory />
        </TabsContent>

        <TabsContent value="nfts" className="space-y-6">
          <NFTGallery />
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <CurrencyConverter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Markets;
