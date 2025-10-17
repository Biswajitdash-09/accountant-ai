import Layout from "@/components/Layout";
import { HMRCConnectionManager } from "@/components/hmrc/HMRCConnectionManager";
import { HMRCDataDisplay } from "@/components/hmrc/HMRCDataDisplay";
import { HMRCTaxSummary } from "@/components/hmrc/HMRCTaxSummary";
import { HMRCSyncStatus } from "@/components/hmrc/HMRCSyncStatus";
import { HMRCOnboarding } from "@/components/hmrc/HMRCOnboarding";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Activity, Settings } from "lucide-react";

const HMRCIntegration = () => {
  const { isConnected, isLoading } = useHMRCConnection();

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HMRC Integration</h1>
          <p className="text-muted-foreground mt-2">
            Connect your HMRC account to automatically import tax data
          </p>
        </div>

      {!isLoading && !isConnected ? (
        <HMRCOnboarding />
      ) : (
        <div className="space-y-6">
          <HMRCConnectionManager />
          
          <Tabs defaultValue="data" className="space-y-6">
            <TabsList>
              <TabsTrigger value="data" className="gap-2">
                <FileText className="h-4 w-4" />
                Tax Data
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-2">
                <Activity className="h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Settings className="h-4 w-4" />
                Sync Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-6">
              <HMRCDataDisplay />
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <HMRCTaxSummary />
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <HMRCSyncStatus />
            </TabsContent>
          </Tabs>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default HMRCIntegration;
