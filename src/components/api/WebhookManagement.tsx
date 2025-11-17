import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebhooks } from "@/hooks/useWebhooks";
import { Webhook, Trash2, Plus, TestTube, Copy, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const availableEvents = [
  { value: "transaction.created", label: "Transaction Created", description: "New transaction added" },
  { value: "report.generated", label: "Report Generated", description: "Report ready for download" },
  { value: "anomaly.detected", label: "Anomaly Detected", description: "Unusual activity found" },
  { value: "tax.calculated", label: "Tax Calculated", description: "Tax calculation complete" },
  { value: "forecast.updated", label: "Forecast Updated", description: "New cashflow forecast available" },
  { value: "insight.new", label: "New Insight", description: "Arnold generated new insight" },
];

export const WebhookManagement = () => {
  const { webhooks, deliveries, webhooksLoading, createWebhook, updateWebhook, deleteWebhook, testWebhook } = useWebhooks();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState<string | null>(null);

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl || selectedEvents.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please provide a URL and select at least one event",
        variant: "destructive",
      });
      return;
    }

    try {
      await createWebhook.mutateAsync({
        url: newWebhookUrl,
        events: selectedEvents,
      });
      setIsDialogOpen(false);
      setNewWebhookUrl("");
      setSelectedEvents([]);
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const copySecret = (secret: string, id: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(id);
    toast({
      title: "Copied!",
      description: "Webhook secret copied to clipboard",
    });
    setTimeout(() => setCopiedSecret(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhook endpoints to receive real-time notifications
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a webhook to receive real-time event notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://your-app.com/api/webhooks"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Subscribe to Events</Label>
                    <ScrollArea className="h-[200px] border rounded-md p-4 mt-2">
                      <div className="space-y-3">
                        {availableEvents.map((event) => (
                          <div key={event.value} className="flex items-start space-x-3">
                            <Checkbox
                              id={event.value}
                              checked={selectedEvents.includes(event.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEvents([...selectedEvents, event.value]);
                                } else {
                                  setSelectedEvents(selectedEvents.filter((e) => e !== event.value));
                                }
                              }}
                            />
                            <div className="space-y-1">
                              <Label htmlFor={event.value} className="font-medium cursor-pointer">
                                {event.label}
                              </Label>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWebhook} disabled={createWebhook.isPending}>
                    {createWebhook.isPending ? "Creating..." : "Create Webhook"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {webhooksLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading webhooks...</div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No webhooks configured. Create one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {webhook.url}
                        </code>
                        <Switch
                          checked={webhook.is_active}
                          onCheckedChange={(checked) =>
                            updateWebhook.mutate({ id: webhook.id, is_active: checked })
                          }
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary">
                            {event}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Secret:</span>
                        <code className="font-mono">
                          {webhook.secret.substring(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copySecret(webhook.secret, webhook.id)}
                        >
                          {copiedSecret === webhook.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testWebhook.mutate(webhook.id)}
                        disabled={testWebhook.isPending}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteWebhook.mutate(webhook.id)}
                        disabled={deleteWebhook.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>
            View webhook delivery logs and retry failed deliveries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deliveries yet
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(delivery.status)}`} />
                        <Badge variant="outline">{delivery.event_type}</Badge>
                        {delivery.http_status && (
                          <Badge variant="secondary">{delivery.http_status}</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(delivery.created_at).toLocaleString()}
                      </span>
                    </div>
                    {delivery.error_message && (
                      <div className="flex items-start gap-2 text-xs text-destructive mt-2">
                        <AlertCircle className="h-3 w-3 mt-0.5" />
                        <span>{delivery.error_message}</span>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Attempts: {delivery.attempts}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* HMAC Signature Guide */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Webhook Security</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            All webhook requests include an <code>X-Webhook-Signature</code> header with an HMAC SHA-256 signature.
          </p>
          <p className="text-muted-foreground">
            Verify this signature using your webhook secret to ensure requests are authentic:
          </p>
          <pre className="bg-background p-3 rounded-md text-xs overflow-x-auto">
{`const crypto = require('crypto');

const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const secret = 'your_webhook_secret';

const hmac = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (hmac === signature) {
  // Signature is valid
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
