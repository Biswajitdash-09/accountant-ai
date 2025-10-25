import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Settings,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building,
  CreditCard,
  Cloud,
  Database,
  Key,
  Webhook,
  Zap,
  Globe,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'banking' | 'payment' | 'accounting' | 'storage' | 'apis';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  features: string[];
  setupRequired: boolean;
  lastSync?: string;
}

const IntegrationManagement = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const { initiateConnection: initiateHMRC, isConnected: isHMRCConnected, connection: hmrcConnection } = useHMRCConnection();

  const integrations: Integration[] = [
    {
      id: 'hmrc',
      name: 'HMRC Integration',
      description: 'Connect to HMRC for automatic tax data import and compliance',
      icon: FileText,
      category: 'accounting',
      status: isHMRCConnected ? 'connected' : 'disconnected',
      features: ['Self Assessment', 'VAT Data', 'Tax Obligations', 'Auto Sync'],
      setupRequired: true,
      lastSync: hmrcConnection?.last_activity_at ? new Date(hmrcConnection.last_activity_at).toLocaleString() : undefined
    },
    {
      id: 'yodlee',
      name: 'Yodlee Banking',
      description: 'Connect bank accounts via Yodlee FastLink for transactions & balances',
      icon: Building,
      category: 'banking',
      status: 'disconnected',
      features: ['FastLink Flow', 'Transaction Import', 'Balance Updates'],
      setupRequired: true
    },
    {
      id: 'truelayer',
      name: 'TrueLayer',
      description: 'UK Open Banking - Connect your UK bank accounts instantly',
      icon: Building,
      category: 'banking',
      status: 'disconnected',
      features: ['UK Banks', 'Open Banking', 'Instant Access', 'Transaction History'],
      setupRequired: true
    },
    {
      id: 'mono',
      name: 'Mono',
      description: 'Connect Nigerian bank accounts and fintech services',
      icon: Building,
      category: 'banking',
      status: 'disconnected',
      features: ['African Banks', 'Fintech APIs', 'Real-time Data', 'Secure'],
      setupRequired: true
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      description: 'Process payments and manage customer billing',
      icon: CreditCard,
      category: 'payment',
      status: 'connected',
      features: ['Payment Processing', 'Subscription Management', 'Invoicing'],
      setupRequired: false,
      lastSync: '2 hours ago'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Sync with QuickBooks for comprehensive accounting',
      icon: Database,
      category: 'accounting',
      status: 'disconnected',
      features: ['Chart of Accounts', 'Invoice Sync', 'Financial Reports'],
      setupRequired: true
    },
    {
      id: 'aws-s3',
      name: 'AWS S3 Storage',
      description: 'Store documents and files in Amazon S3',
      icon: Cloud,
      category: 'storage',
      status: 'pending',
      features: ['Document Storage', 'Backup', 'CDN Integration'],
      setupRequired: true
    },
    {
      id: 'openai',
      name: 'OpenAI API',
      description: 'Enhanced AI features powered by GPT models',
      icon: Zap,
      category: 'apis',
      status: 'connected',
      features: ['Advanced AI Chat', 'Document Analysis', 'Insights Generation'],
      setupRequired: false,
      lastSync: '5 minutes ago'
    },
    {
      id: 'webhooks',
      name: 'Custom Webhooks',
      description: 'Set up custom webhooks for third-party integrations',
      icon: Webhook,
      category: 'apis',
      status: 'disconnected',
      features: ['Real-time Notifications', 'Custom Endpoints', 'Event Triggers'],
      setupRequired: true
    }
  ];

  const categories = [
    { id: 'all', label: 'All Integrations', count: integrations.length },
    { id: 'banking', label: 'Banking', count: integrations.filter(i => i.category === 'banking').length },
    { id: 'payment', label: 'Payments', count: integrations.filter(i => i.category === 'payment').length },
    { id: 'accounting', label: 'Accounting', count: integrations.filter(i => i.category === 'accounting').length },
    { id: 'storage', label: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
    { id: 'apis', label: 'APIs', count: integrations.filter(i => i.category === 'apis').length }
  ];

  const filteredIntegrations = activeTab === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === activeTab);

  // Auto-connect integration from query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const connectParam = params.get('connect');
    
    if (connectParam && !connectingId) {
      const integration = integrations.find(i => i.id === connectParam);
      if (integration) {
        console.log(`Auto-connecting to ${connectParam} from query parameter`);
        handleConnect(integration);
      }
    }
  }, [location.search]);

  const handleConnect = async (integration: Integration) => {
    setConnectingId(integration.id);

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect integrations",
          variant: "destructive",
        });
        setConnectingId(null);
        return;
      }

      console.log(`Connecting to ${integration.id}...`);

      if (integration.id === 'hmrc') {
        // HMRC OAuth flow
        const { data, error } = await supabase.functions.invoke('hmrc-auth-init', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error || !data?.success) {
          console.error('HMRC init error:', error || data);
          throw new Error(data?.message || error?.message || 'Failed to initialize HMRC connection');
        }

        if (data?.authUrl) {
          window.location.href = data.authUrl;
        }
      } else if (integration.id === 'yodlee') {
        // Yodlee FastLink flow
        const { data, error } = await supabase.functions.invoke('yodlee-init', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error || !data?.success) {
          console.error('Yodlee init error:', error || data);
          throw new Error(data?.message || error?.message || 'Failed to initialize Yodlee connection');
        }

        if (data?.fastLinkUrl) {
          // Open FastLink - the URL already includes Bearer prefix
          const fastLinkWindow = window.open(
            data.fastLinkUrl,
            'Yodlee FastLink',
            'width=800,height=600'
          );

          // Poll for window closure
          const checkClosed = setInterval(() => {
            if (fastLinkWindow?.closed) {
              clearInterval(checkClosed);
              toast({
                title: "Connection Complete",
                description: "Yodlee connection has been established",
              });
              setConnectingId(null);
            }
          }, 500);
        }
      } else if (integration.id === 'truelayer') {
        // TrueLayer OAuth flow
        const { data, error } = await supabase.functions.invoke('truelayer-init', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error || !data?.success) {
          console.error('TrueLayer init error:', error || data);
          throw new Error(data?.message || error?.message || 'Failed to initialize TrueLayer connection');
        }

        if (data?.authUrl) {
          window.location.href = data.authUrl;
        }
      } else if (integration.id === 'mono') {
        // Mono Connect flow
        const { data, error } = await supabase.functions.invoke('mono-init', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error || !data?.success) {
          console.error('Mono init error:', error || data);
          throw new Error(data?.message || error?.message || 'Failed to initialize Mono connection');
        }

        if (data?.publicKey) {
          // Load Mono Connect script if not already loaded
          if (!(window as any).Connect) {
            const script = document.createElement('script');
            script.src = 'https://connect.withmono.com/connect.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
              initMonoConnect(data.publicKey, data.reference, session);
            };
          } else {
            initMonoConnect(data.publicKey, data.reference, session);
          }
        }
      } else {
        toast({
          title: "Coming Soon",
          description: `${integration.name} integration will be available soon`,
        });
        setConnectingId(null);
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect integration",
        variant: "destructive",
      });
      setConnectingId(null);
    }
  };

  const initMonoConnect = (publicKey: string, reference: string, session: any) => {
    const monoInstance = new (window as any).Connect({
      key: publicKey,
      reference,
      onSuccess: async (response: any) => {
        try {
          console.log('Mono onSuccess callback:', response);
          
          const { data, error } = await supabase.functions.invoke('mono-callback', {
            body: { code: response.code },
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          });

          if (error || !data?.success) {
            console.error('Mono callback error:', error || data);
            throw new Error(data?.message || error?.message || 'Failed to save Mono connection');
          }

          toast({
            title: "Success",
            description: data?.message || "Mono account connected successfully",
          });
        } catch (error: any) {
          console.error('Mono callback error:', error);
          toast({
            title: "Connection Error",
            description: error.message || "Failed to save Mono connection",
            variant: "destructive",
          });
        } finally {
          setConnectingId(null);
        }
      },
      onClose: () => {
        console.log('Mono widget closed');
        setConnectingId(null);
      },
    });

    monoInstance.open();
  };

  const handleDisconnect = async (integrationId: string) => {
    toast({
      title: "Integration disconnected",
      description: "You can reconnect at any time.",
      variant: "destructive"
    });
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-bold mb-2">Integration Management</h3>
              <p className="opacity-90">Connect third-party services to enhance your financial management</p>
            </div>
            <LinkIcon className="h-12 w-12 opacity-75" />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeTab === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(category.id)}
                className="gap-2"
              >
                {category.label}
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <integration.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Features</Label>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Last Sync */}
                  {integration.lastSync && (
                    <div className="text-xs text-muted-foreground">
                      Last synced: {integration.lastSync}
                    </div>
                  )}

                  {/* Setup Form */}
                  {integration.setupRequired && integration.status === 'disconnected' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <Label className="text-sm font-medium">Configuration Required</Label>
                      <div className="space-y-2">
                        <Input placeholder="API Key" type="password" />
                        <Input placeholder="Secret Key" type="password" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Environment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox</SelectItem>
                            <SelectItem value="production">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => handleConnect(integration)}
                        disabled={connectingId === integration.id}
                        className="w-full"
                        size="sm"
                      >
                        {connectingId === integration.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Integration Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Building className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium mb-2">Bank Connectivity</h4>
              <p className="text-sm text-muted-foreground">
                Automatically import transactions and balances from your bank accounts
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <h4 className="font-medium mb-2">Enhanced AI</h4>
              <p className="text-sm text-muted-foreground">
                Leverage advanced AI models for better insights and automation
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium mb-2">Data Sync</h4>
              <p className="text-sm text-muted-foreground">
                Keep your data synchronized across all your financial tools
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationManagement;