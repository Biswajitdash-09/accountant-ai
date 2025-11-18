import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PaymentStep = "plan" | "method" | "details" | "processing" | "complete";
type PaymentStatus = "idle" | "processing" | "success" | "error";

interface PaymentFlowState {
  step: PaymentStep;
  status: PaymentStatus;
  selectedPlan: string | null;
  selectedMethod: string | null;
  billingCycle: "monthly" | "yearly";
  error: string | null;
}

export const usePaymentFlow = () => {
  const { toast } = useToast();
  const [state, setState] = useState<PaymentFlowState>({
    step: "plan",
    status: "idle",
    selectedPlan: null,
    selectedMethod: null,
    billingCycle: "monthly",
    error: null,
  });

  const selectPlan = (planId: string) => {
    setState((prev) => ({
      ...prev,
      selectedPlan: planId,
      step: "method",
    }));
  };

  const selectMethod = (method: string) => {
    setState((prev) => ({
      ...prev,
      selectedMethod: method,
      step: "details",
    }));
  };

  const setBillingCycle = (cycle: "monthly" | "yearly") => {
    setState((prev) => ({
      ...prev,
      billingCycle: cycle,
    }));
  };

  const goBack = () => {
    setState((prev) => {
      const steps: PaymentStep[] = ["plan", "method", "details", "processing", "complete"];
      const currentIndex = steps.indexOf(prev.step);
      return {
        ...prev,
        step: currentIndex > 0 ? steps[currentIndex - 1] : prev.step,
        error: null,
      };
    });
  };

  const processPayment = async (paymentDetails: any) => {
    setState((prev) => ({
      ...prev,
      step: "processing",
      status: "processing",
      error: null,
    }));

    try {
      const planPrices: Record<string, number> = {
        starter: 9.99,
        pro: 29.99,
        business: 99.99,
      };

      const basePrice = planPrices[state.selectedPlan || "starter"];
      const amount = state.billingCycle === "yearly" ? basePrice * 10 : basePrice;

      // Call unified payment gateway
      const { data, error } = await supabase.functions.invoke("unified-payment-gateway", {
        body: {
          provider: state.selectedMethod,
          plan_id: state.selectedPlan,
          amount,
          currency: "usd",
          payment_method: state.selectedMethod,
          ...paymentDetails,
        },
      });

      if (error) throw error;

      // Check risk score
      if (data.risk_score > 50) {
        toast({
          title: "Payment Under Review",
          description: "Your payment is being reviewed for security. We'll notify you once approved.",
          variant: "default",
        });
      }

      setState((prev) => ({
        ...prev,
        step: "complete",
        status: "success",
      }));

      toast({
        title: "Payment Successful",
        description: "Your credits have been added to your account.",
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      
      setState((prev) => ({
        ...prev,
        status: "error",
        error: error.message || "Payment failed. Please try again.",
      }));

      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    }
  };

  const retry = () => {
    setState((prev) => ({
      ...prev,
      step: "details",
      status: "idle",
      error: null,
    }));
  };

  const reset = () => {
    setState({
      step: "plan",
      status: "idle",
      selectedPlan: null,
      selectedMethod: null,
      billingCycle: "monthly",
      error: null,
    });
  };

  return {
    ...state,
    selectPlan,
    selectMethod,
    setBillingCycle,
    goBack,
    processPayment,
    retry,
    reset,
  };
};
