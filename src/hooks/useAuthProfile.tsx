
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useAuthProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const createOrUpdateProfile = async () => {
      if (!user) return;

      try {
        console.log('Checking/creating profile for user:', user.email);
        
        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching profile:', fetchError);
          return;
        }

        // If profile doesn't exist, create it
        if (!existingProfile) {
          console.log('Creating new profile for user');
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                email: user.email,
                avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
              }
            ]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully');
          }
        } else {
          console.log('Profile already exists');
        }

        // Create default user preferences if they don't exist
        const { data: existingPreferences, error: prefError } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (prefError && prefError.code === 'PGRST116') {
          console.log('Creating default preferences');
          
          const { error: prefInsertError } = await supabase
            .from('user_preferences')
            .insert([
              {
                user_id: user.id,
                timezone: 'UTC',
                date_format: 'MM/DD/YYYY',
                fiscal_year_start: new Date().getFullYear() + '-01-01',
                notification_preferences: {
                  email_notifications: true,
                  push_notifications: true,
                  tax_reminders: true,
                  goal_updates: true,
                  security_alerts: true,
                },
              }
            ]);

          if (prefInsertError) {
            console.error('Error creating preferences:', prefInsertError);
          }
        }

      } catch (error) {
        console.error('Error in profile setup:', error);
      }
    };

    createOrUpdateProfile();
  }, [user]);
};
