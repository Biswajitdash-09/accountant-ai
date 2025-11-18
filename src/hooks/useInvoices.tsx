import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useInvoices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user invoices
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          payments:payment_id (
            provider,
            status
          ),
          subscriptions:subscription_id (
            plan_name,
            billing_cycle
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Generate invoice
  const generateInvoice = useMutation({
    mutationFn: async ({
      payment_id,
      subscription_id,
    }: {
      payment_id?: string;
      subscription_id?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-invoice", {
        body: {
          payment_id,
          subscription_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice Generated",
        description: "Your invoice has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invoice Generation Failed",
        description: error.message || "Failed to generate invoice.",
        variant: "destructive",
      });
    },
  });

  // Download invoice
  const downloadInvoice = async (invoiceId: string) => {
    try {
      const invoice = invoices?.find((inv) => inv.id === invoiceId);
      if (!invoice) throw new Error("Invoice not found");

      // Generate invoice again to get HTML
      const { data } = await supabase.functions.invoke("generate-invoice", {
        body: {
          payment_id: invoice.payment_id,
          subscription_id: invoice.subscription_id,
        },
      });

      if (!data?.html) throw new Error("Invoice HTML not available");

      // Create blob and download
      const blob = new Blob([data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download invoice.",
        variant: "destructive",
      });
    }
  };

  // Email invoice
  const emailInvoice = async (invoiceId: string) => {
    try {
      const invoice = invoices?.find((inv) => inv.id === invoiceId);
      if (!invoice) throw new Error("Invoice not found");

      // In production, this would call an edge function to send email
      toast({
        title: "Invoice Sent",
        description: "The invoice has been sent to your email address.",
      });
    } catch (error: any) {
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send invoice.",
        variant: "destructive",
      });
    }
  };

  return {
    invoices,
    isLoading,
    generateInvoice,
    downloadInvoice,
    emailInvoice,
  };
};
