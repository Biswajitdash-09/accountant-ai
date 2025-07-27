
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export interface UserRole {
  id: string;
  user_id: string;
  entity_id: string;
  role_type: string;
  permissions: any;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface CollaborationInvite {
  id: string;
  inviter_id: string;
  invitee_email: string;
  entity_id: string;
  role_type: string;
  permissions: any;
  invite_token: string;
  status: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
}

export interface ActivityFeed {
  id: string;
  user_id: string;
  entity_id?: string;
  action_type: string;
  action_description: string;
  affected_resource_type?: string;
  affected_resource_id?: string;
  metadata: any;
  created_at: string;
}

export const useCollaboration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: userRoles = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .or(`user_id.eq.${user.id},granted_by.eq.${user.id}`)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!user,
  });

  const {
    data: invites = [],
    isLoading: invitesLoading
  } = useQuery({
    queryKey: ['collaboration_invites'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('collaboration_invites')
        .select('*')
        .eq('inviter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CollaborationInvite[];
    },
    enabled: !!user,
  });

  const {
    data: activityFeed = [],
    isLoading: activityLoading
  } = useQuery({
    queryKey: ['activity_feeds'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('activity_feeds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ActivityFeed[];
    },
    enabled: !!user,
  });

  const createInvite = useMutation({
    mutationFn: async (inviteData: {
      invitee_email: string;
      entity_id: string;
      role_type: string;
      permissions: any;
      expires_at: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const invite_token = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('collaboration_invites')
        .insert([{
          ...inviteData,
          inviter_id: user.id,
          invite_token,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration_invites'] });
      toast({
        title: "Success",
        description: "Collaboration invite sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send collaboration invite.",
        variant: "destructive",
      });
    },
  });

  const logActivity = useMutation({
    mutationFn: async (activityData: {
      entity_id?: string;
      action_type: string;
      action_description: string;
      affected_resource_type?: string;
      affected_resource_id?: string;
      metadata?: any;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activity_feeds')
        .insert([{
          ...activityData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_feeds'] });
    },
  });

  return {
    userRoles,
    invites,
    activityFeed,
    isLoading,
    invitesLoading,
    activityLoading,
    error,
    createInvite,
    logActivity,
  };
};
