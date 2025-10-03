import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'technical_team' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user?.id) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role_type, is_active, expires_at, entity_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .is('entity_id', null); // Only global roles

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles(['user']); // Default to user role
          return;
        }

        // Filter out expired roles and map to UserRole type
        const activeRoles = (data || [])
          .filter(role => !role.expires_at || new Date(role.expires_at) > new Date())
          .map(role => role.role_type as UserRole)
          .filter(role => ['admin', 'technical_team', 'user'].includes(role));

        setRoles(activeRoles.length > 0 ? activeRoles : ['user']);
      } catch (error) {
        console.error('Error in fetchUserRoles:', error);
        setRoles(['user']);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user?.id]);

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = () => hasRole('admin');
  const isTechnicalTeam = () => hasRole('technical_team') || hasRole('admin');
  const isRegularUser = () => !isAdmin() && !isTechnicalTeam();

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isTechnicalTeam,
    isRegularUser,
  };
};
