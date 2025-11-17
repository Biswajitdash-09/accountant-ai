import { IntegrationsDashboard } from "@/components/integrations/IntegrationsDashboard";
import { OpenBankingSandbox } from "@/components/integrations/OpenBankingSandbox";
import { APITestConsole } from "@/components/integrations/APITestConsole";
import { SandboxTestTools } from "@/components/integrations/SandboxTestTools";
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
          <h1 className="text-3xl font-bold">Integrations & API Testing</h1>
          <p className="text-muted-foreground">Connect accounts and test Arnold APIs</p>
        </div>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Accounts</TabsTrigger>
          <TabsTrigger value="api-console">API Console</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard"><IntegrationsDashboard /></TabsContent>
        <TabsContent value="api-console"><APITestConsole /></TabsContent>
        <TabsContent value="sandbox">
          <Card>
            <CardHeader><CardTitle>Open Banking Sandbox</CardTitle></CardHeader>
            <CardContent><OpenBankingSandbox /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="health"><SandboxTestTools /></TabsContent>
      </Tabs>
    </div>
  );
};
export default Integrations;
