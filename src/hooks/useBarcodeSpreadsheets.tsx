
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface BarcodeSpreadsheet {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  headers: string[];
  rows: any[][];
  source_scan_id?: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBarcodeSpreadsheets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: spreadsheets = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['barcode_spreadsheets', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('barcode_spreadsheets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BarcodeSpreadsheet[];
    },
    enabled: !!user,
  });

  const createSpreadsheet = useMutation({
    mutationFn: async (spreadsheetData: {
      title: string;
      description?: string;
      headers: string[];
      rows: any[][];
      source_scan_id?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('barcode_spreadsheets')
        .insert([{
          user_id: user.id,
          ...spreadsheetData
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcode_spreadsheets'] });
      toast({
        title: "Success",
        description: "Spreadsheet created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create spreadsheet.",
        variant: "destructive",
      });
    },
  });

  const updateSpreadsheet = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<BarcodeSpreadsheet> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('barcode_spreadsheets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcode_spreadsheets'] });
      toast({
        title: "Success",
        description: "Spreadsheet updated successfully.",
      });
    },
  });

  return {
    spreadsheets,
    isLoading,
    error,
    createSpreadsheet,
    updateSpreadsheet,
  };
};
