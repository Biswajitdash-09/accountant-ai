import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BusinessEntity {
  id: string;
  user_id: string;
  name: string;
  entity_type: string;
  tax_id?: string;
  address?: any;
  settings?: any;
  created_at: string;
  updated_at: string;
}

export const useBusinessEntities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessEntities = [], isLoading } = useQuery({
    queryKey: ['business_entities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('business_entities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as BusinessEntity[];
    },
  });

  const createBusinessEntity = useMutation({
    mutationFn: async (entityData: Omit<BusinessEntity, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('business_entities')
        .insert([{ ...entityData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_entities'] });
      toast({
        title: "Success",
        description: "Business entity created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create business entity.",
        variant: "destructive",
      });
    },
  });

  const updateBusinessEntity = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BusinessEntity> & { id: string }) => {
      const { data, error } = await supabase
        .from('business_entities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_entities'] });
      toast({
        title: "Success",
        description: "Business entity updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update business entity.",
        variant: "destructive",
      });
    },
  });

  const deleteBusinessEntity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_entities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_entities'] });
      toast({
        title: "Success",
        description: "Business entity deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete business entity.",
        variant: "destructive",
      });
    },
  });

  return {
    businessEntities,
    isLoading,
    createBusinessEntity,
    updateBusinessEntity,
    deleteBusinessEntity,
  };
};
