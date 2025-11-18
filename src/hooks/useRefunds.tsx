import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useRefunds = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user refunds
  const { data: refunds, isLoading } = useQuery({
    queryKey: ["refunds"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("refunds")
        .select(`
          *,
          payments:payment_id (
            amount,
            currency,
            created_at,
            provider
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Request refund
  const requestRefund = useMutation({
    mutationFn: async ({
      payment_id,
      amount,
      reason,
    }: {
      payment_id: string;
      amount?: number;
      reason: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("process-refund", {
        body: {
          payment_id,
          amount,
          reason,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      toast({
        title: "Refund Requested",
        description: "Your refund request has been submitted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund request.",
        variant: "destructive",
      });
    },
  });

  // Check refund eligibility
  const checkEligibility = async (paymentId: string): Promise<{ 
    eligible: boolean; 
    reason?: string;
    daysLeft?: number;
  }> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: payment, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", paymentId)
        .eq("user_id", user.id)
        .single();

      if (error || !payment) {
        return { eligible: false, reason: "Payment not found" };
      }

      if (payment.refunded) {
        return { eligible: false, reason: "Payment already refunded" };
      }

      const paymentDate = new Date(payment.created_at);
      const daysSincePayment = (Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24);
      const daysLeft = Math.max(0, 30 - Math.floor(daysSincePayment));

      if (daysSincePayment > 30) {
        return { 
          eligible: false, 
          reason: "Refund period expired (30 days limit)",
          daysLeft: 0
        };
      }

      return { 
        eligible: true,
        daysLeft
      };
    } catch (error: any) {
      return { 
        eligible: false, 
        reason: error.message || "Unable to check eligibility"
      };
    }
  };

  return {
    refunds,
    isLoading,
    requestRefund,
    checkEligibility,
  };
};
