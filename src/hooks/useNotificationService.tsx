
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNotificationService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Notification change:', payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Helper function to create notifications
  const createNotification = async (
    title: string,
    message: string,
    type: 'task' | 'deadline' | 'financial' | 'system',
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    relatedId?: string,
    relatedType?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title,
          message,
          type,
          priority,
          related_id: relatedId,
          related_type: relatedType,
          is_read: false
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return {
    createNotification
  };
};
