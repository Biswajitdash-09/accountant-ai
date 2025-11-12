import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, Plus, Trash2, Eye, EyeOff, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const APILicensing = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);
  const [apiKeys] = useState([
    {
      id: '1',
      name: 'Production API',
      prefix: 'ak_live_...',
      created: '2024-01-15',
      lastUsed: '2 hours ago',
      requests: 1234,
      isActive: true,
    },
    {
      id: '2',
      name: 'Development API',
      prefix: 'ak_test_...',
      created: '2024-01-10',
      lastUsed: '5 days ago',
      requests: 456,
      isActive: true,
    },
  ]);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied",
    });
  };

  const handleCreateKey = () => {
    toast({
      title: "API Key Created",
      description: "Your new API key has been generated. Make sure to save it securely.",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Key className="h-8 w-8 text-primary" />
          API Licensing & Keys
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys and monitor usage for integrations
        </p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage & Billing</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your API Keys</CardTitle>
                  <CardDescription>Manage access to your account via API</CardDescription>
                </div>
                <Button onClick={handleCreateKey}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((key) => (
                <Card key={key.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{key.name}</h3>
                          <Badge variant={key.isActive ? "default" : "secondary"}>
                            {key.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showKey ? `ak_live_1234567890abcdef` : key.prefix}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowKey(!showKey)}
                          >
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyKey('ak_live_1234567890abcdef')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created: {key.created} • Last used: {key.lastUsed} • {key.requests.toLocaleString()} requests
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>Current usage against your limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Requests per minute</span>
                  <span className="font-medium">45 / 60</span>
                </div>
                <Progress value={75} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly requests</span>
                  <span className="font-medium">1,690 / 10,000</span>
                </div>
                <Progress value={16.9} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,690</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.2%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">142ms</div>
                <p className="text-xs text-muted-foreground">Median latency</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$47.30</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Usage</CardTitle>
              <CardDescription>Most popular endpoints this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { endpoint: '/api/v1/analyze-transactions', requests: 834, percentage: 49 },
                  { endpoint: '/api/v1/tax-calculate', requests: 512, percentage: 30 },
                  { endpoint: '/api/v1/forecast-cashflow', requests: 344, percentage: 21 },
                ].map((endpoint) => (
                  <div key={endpoint.endpoint} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <code className="text-xs">{endpoint.endpoint}</code>
                      <span className="font-medium">{endpoint.requests} requests</span>
                    </div>
                    <Progress value={endpoint.percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhook Endpoints</CardTitle>
                  <CardDescription>Receive real-time notifications for events</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Transaction Notifications</h3>
                        <Badge>Active</Badge>
                      </div>
                      <code className="text-sm bg-muted px-2 py-1 rounded block">
                        https://your-app.com/webhooks/transactions
                      </code>
                      <p className="text-xs text-muted-foreground">
                        Events: transaction.created, transaction.updated
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Logs</CardTitle>
              <CardDescription>Recent webhook delivery attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { event: 'transaction.created', status: 200, time: '2 min ago' },
                  { event: 'transaction.updated', status: 200, time: '15 min ago' },
                  { event: 'transaction.created', status: 500, time: '1 hour ago' },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <code className="text-sm">{log.event}</code>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                    <Badge variant={log.status === 200 ? "default" : "destructive"}>
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APILicensing;