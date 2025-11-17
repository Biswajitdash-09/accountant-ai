import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Copy, Download, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TestHistory {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: Date;
  request: any;
  response: any;
}

const API_ENDPOINTS = [
  {
    name: "Arnold Chat",
    endpoint: "/api-gateway-v1/arnold-chat",
    method: "POST",
    description: "Natural language financial assistant",
    exampleBody: {
      message: "What are my tax obligations for Nigeria in 2024?",
      context: {
        region: "NG",
        currency: "NGN"
      }
    }
  },
  {
    name: "Reports",
    endpoint: "/api-gateway-v1/reports",
    method: "POST",
    description: "Generate financial reports",
    exampleBody: {
      report_type: "financial_summary",
      date_range: {
        start: "2024-01-01",
        end: "2024-12-31"
      },
      sources: ["all"]
    }
  },
  {
    name: "Analytics",
    endpoint: "/api-gateway-v1/analytics",
    method: "GET",
    description: "Get financial analytics and insights",
    exampleParams: "?timeframe=30d&sources=all"
  },
  {
    name: "Tax Calculator",
    endpoint: "/api-gateway-v1/tax",
    method: "POST",
    description: "Calculate taxes for different regions",
    exampleBody: {
      region: "NG",
      tax_year: 2024,
      income_data: 5000000,
      deductions_data: 500000
    }
  },
  {
    name: "Transactions",
    endpoint: "/api-gateway-v1/transactions",
    method: "GET",
    description: "Fetch or create transactions",
    exampleParams: "?start_date=2024-01-01&end_date=2024-12-31&limit=50"
  },
  {
    name: "Cashflow Forecast",
    endpoint: "/api-gateway-v1/forecasts",
    method: "POST",
    description: "Project future cashflow",
    exampleBody: {
      months: 6,
      scenario: "realistic"
    }
  }
];

export const APITestConsole = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [apiKey, setApiKey] = useState("");
  const [requestBody, setRequestBody] = useState(JSON.stringify(selectedEndpoint.exampleBody || {}, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [history, setHistory] = useState<TestHistory[]>([]);
  const [environment, setEnvironment] = useState<"production" | "test">("production");

  const handleEndpointChange = (endpoint: typeof API_ENDPOINTS[0]) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(JSON.stringify(endpoint.exampleBody || {}, null, 2));
    setResponse(null);
  };

  const handleExecute = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to test the endpoint",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const baseUrl = "https://erqisavlnwynkyfvnltb.supabase.co/functions/v1";
      const url = selectedEndpoint.method === "GET"
        ? `${baseUrl}${selectedEndpoint.endpoint}${selectedEndpoint.exampleParams || ''}`
        : `${baseUrl}${selectedEndpoint.endpoint}`;

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      if (selectedEndpoint.method !== "GET") {
        const body = JSON.parse(requestBody);
        options.body = JSON.stringify({ ...body, user_id: user?.id });
      }

      const res = await fetch(url, options);
      const data = await res.json();
      const endTime = Date.now();
      const duration = endTime - startTime;

      setResponse(data);
      setResponseTime(duration);

      // Add to history
      const historyEntry: TestHistory = {
        id: crypto.randomUUID(),
        endpoint: selectedEndpoint.endpoint,
        method: selectedEndpoint.method,
        status: res.status,
        responseTime: duration,
        timestamp: new Date(),
        request: selectedEndpoint.method === "GET" ? null : JSON.parse(requestBody),
        response: data
      };
      setHistory([historyEntry, ...history.slice(0, 9)]);

      toast({
        title: res.ok ? "Success" : "Request Failed",
        description: res.ok 
          ? `Response received in ${duration}ms` 
          : `Status: ${res.status}`,
        variant: res.ok ? "default" : "destructive"
      });
    } catch (error) {
      const endTime = Date.now();
      setResponse({ error: error instanceof Error ? error.message : "Request failed" });
      setResponseTime(endTime - startTime);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Request failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = (language: string) => {
    const body = selectedEndpoint.method !== "GET" ? requestBody : null;
    
    switch (language) {
      case "curl":
        return `curl -X ${selectedEndpoint.method} \\
  "https://erqisavlnwynkyfvnltb.supabase.co/functions/v1${selectedEndpoint.endpoint}${selectedEndpoint.exampleParams || ''}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${body ? ` \\\n  -d '${body}'` : ''}`;
      
      case "javascript":
        return `const response = await fetch('https://erqisavlnwynkyfvnltb.supabase.co/functions/v1${selectedEndpoint.endpoint}${selectedEndpoint.exampleParams || ''}', {
  method: '${selectedEndpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${body ? `,\n  body: JSON.stringify(${body})` : ''}
});
const data = await response.json();
console.log(data);`;
      
      case "python":
        return `import requests

response = requests.${selectedEndpoint.method.toLowerCase()}(
  'https://erqisavlnwynkyfvnltb.supabase.co/functions/v1${selectedEndpoint.endpoint}${selectedEndpoint.exampleParams || ''}',
  headers={
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${body ? `,\n  json=${body}` : ''}
)
data = response.json()
print(data)`;
      
      default:
        return "Language not supported";
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied", description: "Code copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Test Console</CardTitle>
              <CardDescription>Test Arnold API endpoints in real-time</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={environment === "production" ? "default" : "secondary"}>
                {environment}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            <input
              type="password"
              placeholder="ak_live_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-background"
            />
          </div>

          {/* Endpoint Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Endpoint</label>
            <div className="grid grid-cols-2 gap-2">
              {API_ENDPOINTS.map((endpoint) => (
                <Button
                  key={endpoint.endpoint}
                  variant={selectedEndpoint.endpoint === endpoint.endpoint ? "default" : "outline"}
                  onClick={() => handleEndpointChange(endpoint)}
                  className="justify-start"
                >
                  <Badge variant="secondary" className="mr-2">{endpoint.method}</Badge>
                  {endpoint.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Request Body Editor */}
          {selectedEndpoint.method !== "GET" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Request Body</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-64 p-3 rounded-md border bg-background font-mono text-sm"
                placeholder="Enter JSON request body..."
              />
            </div>
          )}

          {/* Execute Button */}
          <Button 
            onClick={handleExecute} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            {isLoading ? "Executing..." : "Execute Request"}
          </Button>
        </CardContent>
      </Card>

      {/* Response */}
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Response
                {response.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {responseTime}ms
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="p-4 rounded-md bg-muted overflow-x-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>Copy code to integrate into your application</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl">
            <TabsList>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            {["curl", "javascript", "python"].map((lang) => (
              <TabsContent key={lang} value={lang}>
                <div className="relative">
                  <pre className="p-4 rounded-md bg-muted overflow-x-auto text-sm">
                    {generateCode(lang)}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(generateCode(lang))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Request History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{entry.method}</Badge>
                    <span className="text-sm font-mono">{entry.endpoint}</span>
                    <Badge variant={entry.status < 400 ? "default" : "destructive"}>
                      {entry.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.responseTime}ms • {entry.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
