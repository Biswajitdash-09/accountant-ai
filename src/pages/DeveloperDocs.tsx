import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Code2, Book, Zap, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const DeveloperDocs = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");

  const codeExamples = {
    javascript: `// Initialize the client
const ArnoldFinance = require('@arnold/finance-sdk');

const client = new ArnoldFinance({
  apiKey: 'your_api_key_here'
});

// Analyze transactions
const analysis = await client.transactions.analyze({
  dateRange: {
    start: '2024-01-01',
    end: '2024-03-31'
  },
  categories: ['income', 'expenses'],
  includeInsights: true
});

console.log(analysis);`,
    python: `# Initialize the client
from arnold_finance import ArnoldClient

client = ArnoldClient(api_key='your_api_key_here')

# Analyze transactions
analysis = client.transactions.analyze(
    date_range={
        'start': '2024-01-01',
        'end': '2024-03-31'
    },
    categories=['income', 'expenses'],
    include_insights=True
)

print(analysis)`,
    curl: `# Analyze transactions
curl -X POST https://api.arnold.finance/v1/analyze-transactions \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-03-31"
    },
    "categories": ["income", "expenses"],
    "includeInsights": true
  }'`,
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            Developer Documentation
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete API reference and integration guides
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Code2 className="h-8 w-8 text-primary mb-2" />
            <CardTitle>API Reference</CardTitle>
            <CardDescription>Complete endpoint documentation</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started in 5 minutes</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Secure your API requests</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="quickstart" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
        </TabsList>

        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Make your first API call in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Get your API key</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate to the API Licensing page and create a new API key. Store it securely.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Choose your language</h3>
                <div className="flex gap-2">
                  <Button
                    variant={selectedLanguage === "javascript" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage("javascript")}
                  >
                    JavaScript
                  </Button>
                  <Button
                    variant={selectedLanguage === "python" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage("python")}
                  >
                    Python
                  </Button>
                  <Button
                    variant={selectedLanguage === "curl" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage("curl")}
                  >
                    cURL
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Make your first request</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code>{codeExamples[selectedLanguage as keyof typeof codeExamples]}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
              <CardDescription>All API endpoints with methods and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>POST</Badge>
                    <code className="text-sm">/api/v1/analyze-transactions</code>
                  </div>
                  <Badge variant="outline">Auth Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyze transaction data with AI insights and categorization
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>POST</Badge>
                    <code className="text-sm">/api/v1/tax-calculate</code>
                  </div>
                  <Badge variant="outline">Auth Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Calculate tax obligations based on region and transaction data
                </p>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>POST</Badge>
                    <code className="text-sm">/api/v1/forecast-cashflow</code>
                  </div>
                  <Badge variant="outline">Auth Required</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate cashflow forecasts using historical data and AI predictions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Authentication</CardTitle>
              <CardDescription>How to authenticate your requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Bearer Token Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the Authorization header:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs">
                    <code>Authorization: Bearer your_api_key_here</code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  - Free tier: 60 requests per minute
                  <br />
                  - Pro tier: 300 requests per minute
                  <br />
                  - Enterprise: Custom limits
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Error Handling</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Common error codes:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 401: Unauthorized - Invalid or missing API key</li>
                  <li>• 429: Too Many Requests - Rate limit exceeded</li>
                  <li>• 500: Internal Server Error - Contact support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Official SDKs</CardTitle>
              <CardDescription>Use our official libraries for faster integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">JavaScript / TypeScript</h3>
                <div className="bg-muted p-3 rounded mb-2">
                  <code className="text-xs">npm install @arnold/finance-sdk</code>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                  View on npm →
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Python</h3>
                <div className="bg-muted p-3 rounded mb-2">
                  <code className="text-xs">pip install arnold-finance</code>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                  View on PyPI →
                </a>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Ruby</h3>
                <div className="bg-muted p-3 rounded mb-2">
                  <code className="text-xs">gem install arnold-finance</code>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                  View on RubyGems →
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperDocs;