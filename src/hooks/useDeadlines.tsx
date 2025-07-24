
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Deadline {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  deadline_date: string;
  deadline_type: 'tax' | 'financial' | 'business' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed' | 'missed';
  notification_days: number[];
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useDeadlines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: deadlines = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['deadlines'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline_date', { ascending: true });

      if (error) throw error;
      return data as Deadline[];
    },
    enabled: !!user,
  });

  const createDeadline = useMutation({
    mutationFn: async (newDeadline: Omit<Deadline, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('deadlines')
        .insert([{ ...newDeadline, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({
        title: "Success",
        description: "Deadline created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create deadline",
        variant: "destructive",
      });
      console.error('Create deadline error:', error);
    },
  });

  const updateDeadline = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deadline> & { id: string }) => {
      const { data, error } = await supabase
        .from('deadlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({
        title: "Success",
        description: "Deadline updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deadline",
        variant: "destructive",
      });
    },
  });

  const deleteDeadline = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deadlines')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast({
        title: "Success",
        description: "Deadline deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deadline",
        variant: "destructive",
      });
    },
  });

  return {
    deadlines,
    isLoading,
    error,
    createDeadline,
    updateDeadline,
    deleteDeadline,
  };
};
