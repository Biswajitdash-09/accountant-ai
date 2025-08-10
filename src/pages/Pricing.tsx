
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Crown, Sparkles } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/components/ui/use-toast";
import CreditBalance from "@/components/CreditBalance";
import DemoAccountBadge from "@/components/DemoAccountBadge";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import BillingDashboard from "@/components/BillingDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addCredits } = useCredits();
  const { toast } = useToast();
  const { formatCurrency, preferredCurrency, baseCurrency } = useCurrencyFormatter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const startSubscription = async (tier: 'basic' | 'professional' | 'enterprise') => {
    try {
      setLoadingTier(tier);
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { tier, currencyCode: preferredCurrency?.code || 'USD' }
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (e: any) {
      toast({ title: 'Subscription error', description: e.message || 'Failed to start subscription.', variant: 'destructive' });
    } finally {
      setLoadingTier(null);
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e: any) {
      toast({ title: 'Portal error', description: e.message || 'Failed to open portal.', variant: 'destructive' });
    }
  };

  const refreshSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      toast({ title: 'Subscription status updated', description: data?.subscribed ? `Active: ${data.subscription_tier}` : 'No active subscription' });
    } catch (e: any) {
      toast({ title: 'Refresh error', description: e.message || 'Failed to refresh.', variant: 'destructive' });
    }
  };

  // Handle payment success/cancellation
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const creditsParam = searchParams.get('credits');
    const planParam = searchParams.get('plan');
    
    if (paymentStatus === 'success' && creditsParam) {
      const creditsAmount = parseInt(creditsParam);
      
      toast({
        title: "Payment Successful! 🎉",
        description: `${creditsAmount} credits have been added to your account.`,
        duration: 5000,
      });
      
      // Force refresh credits
      addCredits.mutate(creditsAmount);
      
      // Clean up URL after a delay to show the success message
      setTimeout(() => {
        navigate('/pricing', { replace: true });
      }, 2000);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. No charges were made.",
        variant: "destructive",
      });
      
      // Clean up URL
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate, addCredits, toast]);

  const paymentStatus = searchParams.get('payment');
  const creditsParam = searchParams.get('credits');

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
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
                  <CreditCard className="h-8 w-8 text-primary" />
                  Buy Credits
                </h1>
                <p className="text-muted-foreground">
                  Purchase credits to unlock advanced AI features and premium functionality
                </p>
              </div>
              
              {/* Credits Display and Currency Switcher */}
              <div className="flex items-center gap-4">
                <CurrencySwitcher />
                <CreditBalance showBuyButton={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Cards */}
        {paymentStatus === 'success' && creditsParam && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                Payment Successful!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 dark:text-green-400">
                Your payment has been processed successfully. {creditsParam} credits have been added to your account.
              </p>
            </CardContent>
          </Card>
        )}

        {paymentStatus === 'cancelled' && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <XCircle className="h-5 w-5" />
                Payment Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 dark:text-red-400">
                Your payment was cancelled. No charges were made to your account.
              </p>
            </CardContent>
          </Card>
        )}

        <DemoAccountBadge />

        {/* Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'basic', name: 'Basic', price: 9.99, features: ['Core AI features', 'Email support'] },
                { id: 'professional', name: 'Professional', price: 29.99, features: ['Everything in Basic', 'Advanced analytics', 'Priority support'] },
                { id: 'enterprise', name: 'Enterprise', price: 99.0, features: ['Everything in Pro', 'SLA & SSO', 'Dedicated success'] },
              ].map((tier) => (
                <Card key={tier.id} className="border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      {tier.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-3xl font-bold">
                      {formatCurrency(tier.price, baseCurrency?.id)}
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {tier.features.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => startSubscription(tier.id as 'basic' | 'professional' | 'enterprise')}
                      disabled={loadingTier === tier.id}
                      className="w-full"
                    >
                      {loadingTier === tier.id ? 'Processing...' : `Choose ${tier.name}`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={manageSubscription}>Manage Subscription</Button>
              <Button variant="outline" onClick={refreshSubscription}>Refresh Status</Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Dashboard */}
        <BillingDashboard />
      </div>
    </div>
  );
};

export default Pricing;
