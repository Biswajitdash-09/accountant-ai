import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, FileText, Network, Scale, Users, Zap, BarChart3, CreditCard } from "lucide-react";
import { DocumentAIManager } from "@/components/advanced/DocumentAIManager";
import { ReportingSystem } from "@/components/advanced/ReportingSystem";
import { MultiEntityManager } from "@/components/advanced/MultiEntityManager";
import { AdvancedTaxManager } from "@/components/advanced/AdvancedTaxManager";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useCredits } from "@/hooks/useCredits";
import { CreditPlans } from "@/components/CreditPlans";
import { useToast } from "@/components/ui/use-toast";
import DemoAccountBadge from "@/components/DemoAccountBadge";

const AdvancedFeatures = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || "credits";
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const { activityFeed } = useCollaboration();
  const { connections } = useIntegrations();
  const { credits, availableCredits, addCredits } = useCredits();
  const { toast } = useToast();

  // Handle payment success
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const creditsParam = searchParams.get('credits');
    
    if (paymentStatus === 'success' && creditsParam) {
      const creditsAmount = parseInt(creditsParam);
      addCredits.mutate(creditsAmount);
      toast({
        title: "Payment Successful!",
        description: `${creditsAmount} credits have been added to your account.`,
      });
      
      // Clean up URL
      navigate('/advanced-features', { replace: true });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. No charges were made.",
        variant: "destructive",
      });
      
      // Clean up URL
      navigate('/advanced-features', { replace: true });
    }
  }, [searchParams, navigate, addCredits, toast]);

  const tabs = [
    { id: "credits", label: "Credit Plans", icon: CreditCard, component: () => <CreditPlans /> },
    { id: "ai-docs", label: "AI Documents", icon: Brain, component: DocumentAIManager },
    { id: "reports", label: "Advanced Reports", icon: FileText, component: ReportingSystem },
    { id: "multi-entity", label: "Multi-Entity", icon: Network, component: MultiEntityManager },
    { id: "tax-advanced", label: "Smart Tax", icon: Scale, component: AdvancedTaxManager },
    { id: "integrations", label: "Integrations", icon: Zap, component: IntegrationsManager },
    { id: "collaboration", label: "Collaboration", icon: Users, component: CollaborationManager }
  ];

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  Credit Plans & Advanced Features
                </h1>
                <p className="text-muted-foreground">
                  Purchase credits and access enterprise-grade financial management tools
                </p>
              </div>
              
              {/* Credits Display */}
              <div className="flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-lg">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {availableCredits} Credits Available
                </span>
              </div>
            </div>
          </div>
        </div>

        <DemoAccountBadge />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-1">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="gap-1 text-xs px-2 py-1"
              >
                <tab.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              <tab.component />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

const IntegrationsManager = () => {
  const { connections, createConnection, testConnection } = useIntegrations();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Integration Management</h3>
          <p className="text-sm text-muted-foreground">
            Connect with external financial services and APIs
          </p>
        </div>
        <Button onClick={() => createConnection.mutate({
          integration_type: 'banking_api',
          connection_name: 'Demo Bank Connection',
          credentials: { api_key: 'demo_key' }
        })}>
          Add Integration
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connections.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No integrations configured yet
          </div>
        ) : (
          connections.map((connection) => (
            <div key={connection.id} className="p-4 border rounded-lg">
              <h4 className="font-medium">{connection.connection_name}</h4>
              <p className="text-sm text-muted-foreground mb-3">{connection.integration_type}</p>
              <Button size="sm" onClick={() => testConnection.mutate(connection.id)}>
                Test Connection
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const CollaborationManager = () => {
  const { activityFeed, createInvite } = useCollaboration();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Team Collaboration</h3>
          <p className="text-sm text-muted-foreground">
            Invite team members and track activity
          </p>
        </div>
        <Button onClick={() => createInvite.mutate({
          invitee_email: 'demo@example.com',
          entity_id: 'demo-entity',
          role_type: 'viewer',
          permissions: { read: true },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })}>
          Invite Member
        </Button>
      </div>
      <div className="space-y-4">
        <h4 className="font-medium">Recent Activity</h4>
        {activityFeed.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-2">
            {activityFeed.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">{activity.action_description}</div>
                  <div className="text-xs text-muted-foreground">{activity.action_type}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedFeatures;
