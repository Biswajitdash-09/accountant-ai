
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";
import { CreditPlans } from "@/components/CreditPlans";
import { useCredits } from "@/hooks/useCredits";
import { useToast } from "@/components/ui/use-toast";
import CreditBalance from "@/components/CreditBalance";
import DemoAccountBadge from "@/components/DemoAccountBadge";

const Pricing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addCredits } = useCredits();
  const { toast } = useToast();

  // Handle payment success/cancellation
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
      navigate('/pricing', { replace: true });
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
              
              {/* Credits Display */}
              <CreditBalance showBuyButton={false} />
            </div>
          </div>
        </div>

        <DemoAccountBadge />

        {/* Credit Plans */}
        <CreditPlans />
      </div>
    </div>
  );
};

export default Pricing;
