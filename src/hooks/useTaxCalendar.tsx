
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface TaxCalendarEvent {
  id: string;
  user_id: string;
  business_entity_id?: string;
  event_title: string;
  event_type: 'quarterly_payment' | 'annual_filing' | 'estimated_payment' | 'document_deadline' | 'custom';
  event_date: string;
  due_date: string;
  description?: string;
  amount: number;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  reminder_days: number[];
  is_recurring: boolean;
  recurrence_pattern?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useTaxCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: calendarEvents = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tax_calendar_events'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tax_calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as TaxCalendarEvent[];
    },
    enabled: !!user,
  });

  const createCalendarEvent = useMutation({
    mutationFn: async (eventData: Omit<TaxCalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tax_calendar_events')
        .insert({
          ...eventData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_calendar_events'] });
      toast({
        title: "Success",
        description: "Calendar event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create calendar event",
        variant: "destructive",
      });
      console.error('Create calendar event error:', error);
    },
  });

  const updateCalendarEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaxCalendarEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('tax_calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_calendar_events'] });
      toast({
        title: "Success",
        description: "Calendar event updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update calendar event",
        variant: "destructive",
      });
    },
  });

  const deleteCalendarEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tax_calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_calendar_events'] });
      toast({
        title: "Success",
        description: "Calendar event deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete calendar event",
        variant: "destructive",
      });
    },
  });

  const initializeDefaultCalendar = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('create_default_tax_calendar', {
        p_user_id: user.id
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_calendar_events'] });
      toast({
        title: "Success",
        description: "Default tax calendar created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to initialize tax calendar",
        variant: "destructive",
      });
      console.error('Initialize calendar error:', error);
    },
  });

  return {
    calendarEvents,
    isLoading,
    error,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    initializeDefaultCalendar,
  };
};
