import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, ExternalLink, PlayCircle, Globe, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

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

// Mock API responses
const getMockResponse = (endpoint: SandboxEndpoint, provider: string) => {
  const responses: Record<string, any> = {
    "/link/token/create": {
      link_token: "link-sandbox-abc123def456",
      expiration: "2025-12-31T23:59:59Z",
      request_id: "req_" + Math.random().toString(36).substr(2, 9)
    },
    "/accounts/get": {
      accounts: [
        {
          account_id: "acc_123456",
          name: "Checking Account",
          type: "depository",
          subtype: "checking",
          balances: {
            available: 2500.50,
            current: 2800.75,
            currency: "USD"
          }
        }
      ]
    },
    "/transactions/get": {
      transactions: [
        {
          transaction_id: "txn_001",
          amount: -45.67,
          date: "2025-01-15",
          name: "Amazon Purchase",
          category: ["Shopping", "Online"]
        }
      ]
    },
    "/account/auth": {
      id: "mono_auth_" + Math.random().toString(36).substr(2, 9),
      type: "mono",
      status: "successful"
    },
    "/accounts/:id": {
      account: {
        id: "acc_mono_123",
        institution: "GTBank",
        name: "Savings Account",
        currency: "NGN",
        balance: 450000.00
      }
    },
    "/auth/token": {
      token: {
        accessToken: "yodlee_token_" + Math.random().toString(36).substr(2, 16),
        expiresIn: 1800
      }
    },
    "/connect/token": {
      auth_url: "https://auth.truelayer-sandbox.com/connect?token=tl_" + Math.random().toString(36).substr(2, 12),
      expires_at: "2025-01-20T12:00:00Z"
    },
    "/v1/sessions": {
      session_id: "setu_session_" + Math.random().toString(36).substr(2, 10),
      redirect_url: "https://setu.co/consent?session=" + Math.random().toString(36).substr(2, 8),
      status: "created"
    }
  };

  return responses[endpoint.endpoint] || {
    success: true,
    message: "Mock response for " + endpoint.name,
    data: { sample: "data" }
  };
};

// Code examples
const getCodeExample = (endpoint: SandboxEndpoint, provider: string) => {
  const examples: Record<string, string> = {
    plaid: `// Plaid - ${endpoint.name}
const response = await fetch('https://sandbox.plaid.com${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
    'PLAID-SECRET': process.env.PLAID_SECRET
  },
  body: JSON.stringify({
    client_name: 'AccountantAI',
    country_codes: ['US'],
    language: 'en',
    user: { client_user_id: 'user_123' }
  })
});

const data = await response.json();
console.log(data);`,
    mono: `// Mono - ${endpoint.name}
const response = await fetch('https://api.withmono.com${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'mono-sec-key': process.env.MONO_SECRET_KEY
  }
});

const data = await response.json();
console.log(data);`,
    yodlee: `// Yodlee - ${endpoint.name}
const response = await fetch('https://sandbox.api.yodlee.com/ysl${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'Api-Version': '1.1',
    'loginName': 'sbMemtest1'
  }
});

const data = await response.json();
console.log(data);`,
    truelayer: `// TrueLayer - ${endpoint.name}
const response = await fetch('https://api.truelayer-sandbox.com${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  }
});

const data = await response.json();
console.log(data);`,
    setu: `// Setu - ${endpoint.name}
const response = await fetch('https://sandbox.setu.co${endpoint.endpoint}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    'x-client-id': process.env.SETU_CLIENT_ID,
    'x-client-secret': process.env.SETU_CLIENT_SECRET
  }
});

const data = await response.json();
console.log(data);`
  };

  return examples[provider] || `// ${provider} - ${endpoint.name}\n// Code example for ${endpoint.method} ${endpoint.endpoint}`;
};

export const OpenBankingSandbox = () => {
  const [selectedIntegration, setSelectedIntegration] = useState<keyof typeof integrations>("plaid");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<SandboxEndpoint | null>(null);
  const { toast } = useToast();

  const currentIntegration = integrations[selectedIntegration];

  const handleTryEndpoint = async (endpoint: SandboxEndpoint) => {
    setCurrentEndpoint(endpoint);
    setIsExecuting(true);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResponse = getMockResponse(endpoint, selectedIntegration);
    setApiResponse(mockResponse);
    setIsExecuting(false);
    setResponseDialogOpen(true);
    
    toast({
      title: "API Request Successful",
      description: `${endpoint.method} ${endpoint.endpoint} executed successfully`,
    });
  };

  const handleViewExample = (endpoint: SandboxEndpoint) => {
    setCurrentEndpoint(endpoint);
    setCodeDialogOpen(true);
  };

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
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleTryEndpoint(endpoint)}
                            disabled={isExecuting}
                          >
                            {isExecuting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Executing...
                              </>
                            ) : (
                              <>
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Try it now
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewExample(endpoint)}
                          >
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

      {/* API Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Response - {currentEndpoint?.name}</DialogTitle>
            <DialogDescription>
              Simulated response from {currentEndpoint?.method} {currentEndpoint?.endpoint}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
              <code>{JSON.stringify(apiResponse, null, 2)}</code>
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Code Example Dialog */}
      <Dialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Code Example - {currentEndpoint?.name}</DialogTitle>
            <DialogDescription>
              Implementation example for {currentIntegration.name}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
              <code>{currentEndpoint ? getCodeExample(currentEndpoint, selectedIntegration) : ''}</code>
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
