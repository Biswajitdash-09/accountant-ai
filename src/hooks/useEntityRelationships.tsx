
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface EntityRelationship {
  id: string;
  parent_entity_id: string;
  child_entity_id: string;
  relationship_type: string;
  ownership_percentage: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface InterEntityTransaction {
  id: string;
  user_id: string;
  from_entity_id?: string;
  to_entity_id?: string;
  transaction_type: string;
  amount: number;
  currency_id?: string;
  description?: string;
  reference_number?: string;
  transaction_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useEntityRelationships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: relationships = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['entity_relationships'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('entity_relationships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as EntityRelationship[];
    },
    enabled: !!user,
  });

  const {
    data: interEntityTransactions = [],
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: ['inter_entity_transactions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('inter_entity_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as InterEntityTransaction[];
    },
    enabled: !!user,
  });

  const createRelationship = useMutation({
    mutationFn: async (relationshipData: {
      parent_entity_id: string;
      child_entity_id: string;
      relationship_type: string;
      ownership_percentage?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('entity_relationships')
        .insert([{
          ...relationshipData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity_relationships'] });
      toast({
        title: "Success",
        description: "Entity relationship created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create entity relationship.",
        variant: "destructive",
      });
    },
  });

  const deleteRelationship = useMutation({
    mutationFn: async (relationshipId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('entity_relationships')
        .delete()
        .eq('id', relationshipId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity_relationships'] });
      toast({
        title: "Success",
        description: "Entity relationship deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete entity relationship.",
        variant: "destructive",
      });
    },
  });

  const createInterEntityTransaction = useMutation({
    mutationFn: async (transactionData: {
      from_entity_id?: string;
      to_entity_id?: string;
      transaction_type: string;
      amount: number;
      currency_id?: string;
      description?: string;
      reference_number?: string;
      transaction_date: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('inter_entity_transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inter_entity_transactions'] });
      toast({
        title: "Success",
        description: "Inter-entity transaction created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create inter-entity transaction.",
        variant: "destructive",
      });
    },
  });

  return {
    relationships,
    interEntityTransactions,
    isLoading,
    transactionsLoading,
    error,
    createRelationship,
    deleteRelationship,
    createInterEntityTransaction,
  };
};
