import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, ExternalLink, PlayCircle, Globe } from "lucide-react";
import { useState } from "react";

interface SandboxEndpoint {
  name: string;
  method: string;
  endpoint: string;
  description: string;
  testCredentials?: Record<string, string>;
}

const integrations = {
  plaid: {
    name: "Plaid (US)",
    color: "bg-blue-500",
    endpoints: [
      {
        name: "Create Link Token",
        method: "POST",
        endpoint: "/link/token/create",
        description: "Initialize Plaid Link for account connection",
        testCredentials: {
          public_key: "sandbox-plaid-public-key",
          user_id: "test_user_123",
        },
      },
      {
        name: "Get Accounts",
        method: "POST",
        endpoint: "/accounts/get",
        description: "Retrieve account balances and information",
      },
      {
        name: "Get Transactions",
        method: "POST",
        endpoint: "/transactions/get",
        description: "Fetch transaction history",
      },
    ],
    docs: "https://plaid.com/docs/sandbox",
  },
  mono: {
    name: "Mono (Nigeria)",
    color: "bg-green-600",
    endpoints: [
      {
        name: "Initialize Connect",
        method: "POST",
        endpoint: "/account/auth",
        description: "Start Mono Connect widget",
        testCredentials: {
          public_key: "test_pk_abc123",
        },
      },
      {
        name: "Get Account Info",
        method: "GET",
        endpoint: "/accounts/:id",
        description: "Retrieve linked account details",
      },
      {
        name: "Fetch Transactions",
        method: "GET",
        endpoint: "/accounts/:id/transactions",
        description: "Get transaction data",
      },
    ],
    docs: "https://docs.mono.co/docs/intro",
  },
  yodlee: {
    name: "Yodlee (Global)",
    color: "bg-purple-500",
    endpoints: [
      {
        name: "User Login",
        method: "POST",
        endpoint: "/auth/token",
        description: "Authenticate user and get access token",
        testCredentials: {
          loginName: "sbMemtest1",
          password: "sbMemtest1#123",
        },
      },
      {
        name: "Add Account",
        method: "POST",
        endpoint: "/providers/:providerId",
        description: "Link a financial institution",
      },
      {
        name: "Get Accounts",
        method: "GET",
        endpoint: "/accounts",
        description: "List all linked accounts",
      },
    ],
    docs: "https://developer.yodlee.com/docs",
  },
  truelayer: {
    name: "TrueLayer (UK/EU)",
    color: "bg-indigo-500",
    endpoints: [
      {
        name: "Get Auth Link",
        method: "POST",
        endpoint: "/connect/token",
        description: "Generate authorization URL",
        testCredentials: {
          client_id: "sandbox-client-id",
          provider_id: "uk-ob-all",
        },
      },
      {
        name: "Get Accounts",
        method: "GET",
        endpoint: "/data/v1/accounts",
        description: "Retrieve account list",
      },
      {
        name: "Get Balance",
        method: "GET",
        endpoint: "/data/v1/accounts/:id/balance",
        description: "Get account balance",
      },
    ],
    docs: "https://docs.truelayer.com",
  },
  setu: {
    name: "Setu (India)",
    color: "bg-orange-500",
    endpoints: [
      {
        name: "Create Session",
        method: "POST",
        endpoint: "/v1/sessions",
        description: "Initialize Account Aggregator session",
        testCredentials: {
          client_id: "test_client_id",
          redirect_url: "https://yourapp.com/callback",
        },
      },
      {
        name: "Get Accounts",
        method: "GET",
        endpoint: "/v1/accounts",
        description: "List linked financial accounts",
      },
      {
        name: "Fetch Data",
        method: "POST",
        endpoint: "/v1/data/fetch",
        description: "Get account data",
      },
    ],
    docs: "https://docs.setu.co",
  },
};

export const OpenBankingSandbox = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<keyof typeof integrations>("plaid");

  const currentIntegration = integrations[selectedIntegration];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Open Banking API Sandbox Explorer
          </CardTitle>
          <CardDescription>
            Test and explore open banking integrations in sandbox mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedIntegration} onValueChange={(v) => setSelectedIntegration(v as keyof typeof integrations)}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="plaid">Plaid</TabsTrigger>
              <TabsTrigger value="mono">Mono</TabsTrigger>
              <TabsTrigger value="yodlee">Yodlee</TabsTrigger>
              <TabsTrigger value="truelayer">TrueLayer</TabsTrigger>
              <TabsTrigger value="setu">Setu</TabsTrigger>
            </TabsList>

            {(Object.keys(integrations) as Array<keyof typeof integrations>).map((key) => {
              const integration = integrations[key];
              return (
              <TabsContent key={key} value={key} className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${integration.color}`} />
                    <h3 className="text-lg font-semibold">{integration.name}</h3>
                    <Badge variant="secondary">Sandbox Mode</Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={integration.docs} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentation
                    </a>
                  </Button>
                </div>

                <div className="space-y-3">
                  {integration.endpoints.map((endpoint, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{endpoint.name}</CardTitle>
                            <CardDescription className="mt-1">{endpoint.description}</CardDescription>
                          </div>
                          <Badge variant="outline">
                            {endpoint.method}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-muted p-3 rounded-md font-mono text-sm">
                          <span className="text-muted-foreground">
                            {endpoint.method} 
                          </span>
                          {" "}
                          <span className="text-foreground">{endpoint.endpoint}</span>
                        </div>

                        {endpoint.testCredentials && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Test Credentials:</p>
                            <div className="bg-muted p-3 rounded-md space-y-1">
                              {Object.entries(endpoint.testCredentials).map(([key, value]) => (
                                <div key={key} className="font-mono text-xs flex gap-2">
                                  <span className="text-muted-foreground">{key}:</span>
                                  <span className="text-foreground">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Try it now
                          </Button>
                          <Button size="sm" variant="outline">
                            <Code className="h-4 w-4 mr-2" />
                            View Example
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
