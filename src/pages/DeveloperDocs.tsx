import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code, Copy, Check, BookOpen, Zap, Shield, Globe, Terminal, Rocket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DeveloperDocs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      name: "Arnold Universal Chat",
      method: "POST",
      path: "/api-v1-arnold-universal",
      description: "Natural language interface to all Arnold features",
      auth: "Required",
      rateLimit: "60/min",
    },
    {
      name: "Arnold Chat",
      method: "POST",
      path: "/api-v1-arnold-chat",
      description: "AI-powered financial chat assistant",
      auth: "Required",
      rateLimit: "60/min",
    },
    {
      name: "Generate Reports",
      method: "POST",
      path: "/api-v1-reports",
      description: "Generate financial reports in various formats",
      auth: "Required",
      rateLimit: "60/min",
    },
    {
      name: "Get Analytics",
      method: "GET",
      path: "/api-v1-analytics",
      description: "Retrieve financial analytics and insights",
      auth: "Required",
      rateLimit: "60/min",
    },
    {
      name: "Calculate Tax",
      method: "POST",
      path: "/api-v1-tax",
      description: "Multi-region tax calculations with optimization",
      auth: "Required",
      rateLimit: "60/min",
    },
    {
      name: "Manage Transactions",
      method: "GET/POST",
      path: "/api-v1-transactions",
      description: "CRUD operations for transactions",
      auth: "Required",
      rateLimit: "60/min",
    },
    {
      name: "Generate Forecasts",
      method: "POST",
      path: "/api-v1-forecasts",
      description: "AI-powered cashflow forecasting",
      auth: "Required",
      rateLimit: "60/min",
    },
  ];

  const quickstartCode = {
    curl: `curl -X POST https://erqisavlnwynkyfvnltb.supabase.co/functions/v1/api-v1-arnold-universal \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What are my tax obligations for Nigeria in 2024?",
    "user_context": {
      "region": "NG",
      "currency": "NGN"
    }
  }'`,
    javascript: `const response = await fetch(
  'https://erqisavlnwynkyfvnltb.supabase.co/functions/v1/api-v1-arnold-universal',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: 'What are my tax obligations for Nigeria in 2024?',
      user_context: {
        region: 'NG',
        currency: 'NGN'
      }
    })
  }
);

const data = await response.json();
console.log(data.answer);`,
    python: `import requests

response = requests.post(
    'https://erqisavlnwynkyfvnltb.supabase.co/functions/v1/api-v1-arnold-universal',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'query': 'What are my tax obligations for Nigeria in 2024?',
        'user_context': {
            'region': 'NG',
            'currency': 'NGN'
        }
    }
)

data = response.json()
print(data['answer'])`,
    php: `<?php
$ch = curl_init('https://erqisavlnwynkyfvnltb.supabase.co/functions/v1/api-v1-arnold-universal');

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_API_KEY',
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'query' => 'What are my tax obligations for Nigeria in 2024?',
        'user_context' => [
            'region' => 'NG',
            'currency' => 'NGN'
        ]
    ])
]);

$response = curl_exec($ch);
$data = json_decode($response);

echo $data->answer;
?>`,
  };

  const useCases = [
    {
      icon: Zap,
      title: "Fintech Apps",
      description: "Add AI-powered accounting to your banking app",
      example: `// Integrate Arnold chat into your app
const arnoldResponse = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + apiKey },
  body: JSON.stringify({
    query: 'Analyze this month spending',
    user_context: { user_id: currentUser.id }
  })
});`,
    },
    {
      icon: Shield,
      title: "Wealthtech Platforms",
      description: "Integrate tax optimization for your users",
      example: `// Calculate optimized taxes
const taxOptimization = await fetch(taxApiUrl, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + apiKey },
  body: JSON.stringify({
    region: 'NG',
    tax_year: 2024,
    include_investments: true,
    include_crypto: true
  })
});`,
    },
    {
      icon: Globe,
      title: "Accounting Software",
      description: "Automate report generation for clients",
      example: `// Generate financial reports
const report = await fetch(reportsApiUrl, {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + apiKey },
  body: JSON.stringify({
    report_type: 'profit_loss',
    date_range: { start: '2024-01-01', end: '2024-12-31' },
    format: 'pdf'
  })
});`,
    },
  ];

  const guides = [
    {
      title: "Getting Started in 5 Minutes",
      steps: [
        "Sign up and navigate to API Licensing page",
        "Generate your first API key (ak_live_...)",
        "Copy the example code for your language",
        "Replace YOUR_API_KEY with your actual key",
        "Make your first API call and see the magic!",
      ],
    },
    {
      title: "Authentication Guide",
      steps: [
        "All API requests require Bearer token authentication",
        "Include header: Authorization: Bearer YOUR_API_KEY",
        "Use test keys (ak_test_...) for development",
        "Switch to live keys (ak_live_...) for production",
        "Never expose API keys in client-side code",
      ],
    },
    {
      title: "Error Handling",
      steps: [
        "API returns standard HTTP status codes",
        "400: Bad request - check your parameters",
        "401: Unauthorized - invalid or missing API key",
        "429: Rate limit exceeded - slow down requests",
        "500: Server error - contact support if persistent",
      ],
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Developer Documentation</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Integrate Arnold AI into your fintech, wealthtech, or accounting application
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              7 Endpoints
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Shield className="h-3 w-3" />
              99.9% Uptime
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              Multi-Region
            </Badge>
          </div>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Quick Start
            </CardTitle>
            <CardDescription>
              Get started with Arnold API in under 5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript" className="w-full">
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
              </TabsList>
              {Object.entries(quickstartCode).map(([lang, code]) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div className="relative">
                    <ScrollArea className="h-[300px] w-full rounded-md border bg-muted p-4">
                      <pre className="text-sm">
                        <code>{code}</code>
                      </pre>
                    </ScrollArea>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(code, lang)}
                    >
                      {copiedCode === lang ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              API Endpoints
            </CardTitle>
            <CardDescription>
              Complete reference for all available endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endpoints.map((endpoint, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <h3 className="font-semibold">{endpoint.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="secondary">
                          🔐 {endpoint.auth}
                        </Badge>
                        <Badge variant="secondary">
                          ⚡ {endpoint.rateLimit}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Use Cases & Examples</CardTitle>
            <CardDescription>
              Real-world integration examples for different industries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <useCase.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{useCase.title}</CardTitle>
                    </div>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <ScrollArea className="h-[200px] w-full rounded border bg-muted p-3">
                        <pre className="text-xs">
                          <code>{useCase.example}</code>
                        </pre>
                      </ScrollArea>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1"
                        onClick={() => copyCode(useCase.example, `usecase-${idx}`)}
                      >
                        {copiedCode === `usecase-${idx}` ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guides */}
        <Card>
          <CardHeader>
            <CardTitle>Step-by-Step Guides</CardTitle>
            <CardDescription>
              Comprehensive guides to help you integrate successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {guides.map((guide, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      {idx + 1}
                    </span>
                    {guide.title}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {guide.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              We're here to help you succeed with Arnold API
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Button variant="default" size="lg">
              <Code className="h-4 w-4 mr-2" />
              Try API Console
            </Button>
            <Button variant="outline" size="lg">
              <BookOpen className="h-4 w-4 mr-2" />
              View Full Docs
            </Button>
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
