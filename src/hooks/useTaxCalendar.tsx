
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
      
      try {
        const { data, error } = await supabase
          .from('tax_calendar_events' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('event_date', { ascending: true });

        if (error) {
          console.error('Error fetching tax calendar events:', error);
          return [];
        }
        
        return (data || []) as TaxCalendarEvent[];
      } catch (err) {
        console.error('Tax calendar fetch error:', err);
        return [];
      }
    },
    enabled: !!user,
  });

  const createCalendarEvent = useMutation({
    mutationFn: async (eventData: Omit<TaxCalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      try {
        const { data, error } = await supabase
          .from('tax_calendar_events' as any)
          .insert({
            ...eventData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Create calendar event error:', error);
        throw error;
      }
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
      try {
        const { data, error } = await supabase
          .from('tax_calendar_events' as any)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Update calendar event error:', error);
        throw error;
      }
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
      try {
        const { error } = await supabase
          .from('tax_calendar_events' as any)
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (error) {
        console.error('Delete calendar event error:', error);
        throw error;
      }
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

      try {
        // Create default events manually since RPC might not be available yet
        const currentYear = new Date().getFullYear();
        const defaultEvents = [
          {
            user_id: user.id,
            event_title: 'Q1 Estimated Tax Payment',
            event_type: 'quarterly_payment' as const,
            event_date: `${currentYear}-04-15`,
            due_date: `${currentYear}-04-15`,
            description: 'First quarter estimated tax payment due',
            amount: 0,
            status: 'pending' as const,
            reminder_days: [30, 7, 1],
            is_recurring: false,
            metadata: {}
          },
          {
            user_id: user.id,
            event_title: 'Q2 Estimated Tax Payment',
            event_type: 'quarterly_payment' as const,
            event_date: `${currentYear}-06-15`,
            due_date: `${currentYear}-06-15`,
            description: 'Second quarter estimated tax payment due',
            amount: 0,
            status: 'pending' as const,
            reminder_days: [30, 7, 1],
            is_recurring: false,
            metadata: {}
          },
          {
            user_id: user.id,
            event_title: 'Q3 Estimated Tax Payment',
            event_type: 'quarterly_payment' as const,
            event_date: `${currentYear}-09-15`,
            due_date: `${currentYear}-09-15`,
            description: 'Third quarter estimated tax payment due',
            amount: 0,
            status: 'pending' as const,
            reminder_days: [30, 7, 1],
            is_recurring: false,
            metadata: {}
          },
          {
            user_id: user.id,
            event_title: 'Q4 Estimated Tax Payment',
            event_type: 'quarterly_payment' as const,
            event_date: `${currentYear + 1}-01-15`,
            due_date: `${currentYear + 1}-01-15`,
            description: 'Fourth quarter estimated tax payment due',
            amount: 0,
            status: 'pending' as const,
            reminder_days: [30, 7, 1],
            is_recurring: false,
            metadata: {}
          },
          {
            user_id: user.id,
            event_title: 'Annual Tax Return Filing',
            event_type: 'annual_filing' as const,
            event_date: `${currentYear + 1}-04-15`,
            due_date: `${currentYear + 1}-04-15`,
            description: 'Annual tax return filing deadline',
            amount: 0,
            status: 'pending' as const,
            reminder_days: [30, 7, 1],
            is_recurring: true,
            recurrence_pattern: 'yearly',
            metadata: {}
          }
        ];

        const { error } = await supabase
          .from('tax_calendar_events' as any)
          .insert(defaultEvents);

        if (error) throw error;
      } catch (error) {
        console.error('Initialize calendar error:', error);
        throw error;
      }
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
