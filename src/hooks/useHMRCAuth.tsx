import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useHMRCAuth = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleCallback = useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const { data, error } = await supabase.functions.invoke('hmrc-callback', {
        body: { code, state }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hmrc_connection'] });
      toast({
        title: "Connected Successfully",
        description: "Your HMRC account has been connected",
      });
      navigate('/hmrc');
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
      navigate('/hmrc');
    },
  });

  return {
    handleCallback,
    isProcessing: handleCallback.isPending,
  };
};
