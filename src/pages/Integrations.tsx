import { IntegrationsDashboard } from "@/components/integrations/IntegrationsDashboard";
import { OpenBankingSandbox } from "@/components/integrations/OpenBankingSandbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plug } from "lucide-react";

const Integrations = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Plug className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your financial accounts and explore our Open Banking sandbox
          </p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Connected Accounts</TabsTrigger>
          <TabsTrigger value="sandbox">Open Banking Sandbox</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <IntegrationsDashboard />
        </TabsContent>

        <TabsContent value="sandbox" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Banking API Sandbox</CardTitle>
              <CardDescription>
                Test and explore Open Banking APIs from multiple providers in a safe sandbox environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OpenBankingSandbox />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
