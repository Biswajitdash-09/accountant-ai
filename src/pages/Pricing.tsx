
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/components/ui/use-toast";
import CreditBalance from "@/components/CreditBalance";
import DemoAccountBadge from "@/components/DemoAccountBadge";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { EnhancedCreditPlans } from "@/components/EnhancedCreditPlans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addCredits } = useCredits();
  const { toast } = useToast();

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

        {/* Enhanced Credit Plans */}
        <EnhancedCreditPlans />
      </div>
    </div>
  );
};

export default Pricing;
