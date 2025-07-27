
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface DocumentAIAnalysis {
  id: string;
  document_id: string;
  user_id: string;
  analysis_type: string;
  confidence_score: number;
  extracted_data: any;
  suggested_categorization: any;
  created_at: string;
  updated_at: string;
}

export const useDocumentAI = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: analyses = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['document_ai_analysis'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('document_ai_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DocumentAIAnalysis[];
    },
    enabled: !!user,
  });

  const createAnalysis = useMutation({
    mutationFn: async (analysisData: {
      document_id: string;
      analysis_type: string;
      confidence_score?: number;
      extracted_data?: any;
      suggested_categorization?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('document_ai_analysis')
        .insert([{
          ...analysisData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document_ai_analysis'] });
      toast({
        title: "Success",
        description: "Document analysis created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create document analysis.",
        variant: "destructive",
      });
    },
  });

  return {
    analyses,
    isLoading,
    error,
    createAnalysis,
  };
};
