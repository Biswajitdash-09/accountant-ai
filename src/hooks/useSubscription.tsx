import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user subscriptions
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create subscription
  const createSubscription = useMutation({
    mutationFn: async ({
      plan_id,
      billing_cycle,
    }: {
      plan_id: string;
      billing_cycle: "monthly" | "yearly";
    }) => {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: {
          action: "create",
          plan_id,
          billing_cycle,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["user-credits"] });
      toast({
        title: "Subscription Created",
        description: "Your subscription has been activated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to create subscription.",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription
  const cancelSubscription = useMutation({
    mutationFn: async (subscription_id: string) => {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: {
          action: "cancel",
          subscription_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the billing period.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription.",
        variant: "destructive",
      });
    },
  });

  // Update subscription
  const updateSubscription = useMutation({
    mutationFn: async ({
      subscription_id,
      plan_id,
    }: {
      subscription_id: string;
      plan_id: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: {
          action: "update",
          subscription_id,
          plan_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Subscription Updated",
        description: "Your subscription plan has been changed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update subscription.",
        variant: "destructive",
      });
    },
  });

  // Pause subscription
  const pauseSubscription = useMutation({
    mutationFn: async (subscription_id: string) => {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: {
          action: "pause",
          subscription_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Subscription Paused",
        description: "Your subscription has been paused.",
      });
    },
  });

  // Resume subscription
  const resumeSubscription = useMutation({
    mutationFn: async (subscription_id: string) => {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: {
          action: "resume",
          subscription_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Subscription Resumed",
        description: "Your subscription has been reactivated.",
      });
    },
  });

  const activeSubscription = subscriptions?.find((sub) => sub.status === "active");

  return {
    subscriptions,
    activeSubscription,
    isLoading,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    pauseSubscription,
    resumeSubscription,
  };
};
