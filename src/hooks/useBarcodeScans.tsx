
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface BarcodeScan {
  id: string;
  user_id: string;
  scan_type: 'receipt' | 'spreadsheet' | 'upi' | 'other';
  raw_content: string;
  parsed_data: any;
  confidence: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useBarcodeScans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: scans = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['barcode_scans', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('barcode_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BarcodeScan[];
    },
    enabled: !!user,
  });

  const createScan = useMutation({
    mutationFn: async (scanData: {
      scan_type: 'receipt' | 'spreadsheet' | 'upi' | 'other';
      raw_content: string;
      parsed_data?: any;
      confidence?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('barcode_scans')
        .insert([{
          user_id: user.id,
          ...scanData,
          parsed_data: scanData.parsed_data || {},
          confidence: scanData.confidence || 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcode_scans'] });
      toast({
        title: "Success",
        description: "Barcode scan saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save barcode scan.",
        variant: "destructive",
      });
    },
  });

  return {
    scans,
    isLoading,
    error,
    createScan,
  };
};
