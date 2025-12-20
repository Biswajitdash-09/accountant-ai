
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useDemoAwareData } from "./useDemoAwareData";

export interface Account {
  id: string;
  user_id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency_id?: string;
  created_at: string;
  updated_at?: string;
}

export const useAccounts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isDemo, showDemoSavePrompt, getAccountsData } = useDemoAwareData();

  // Set up real-time subscription only for authenticated users
  useEffect(() => {
    if (!user || isDemo) return;

    const channel = supabase
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['accounts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, isDemo]);

  const {
    data: accounts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      // Return demo data if in demo mode
      if (isDemo) {
        return getAccountsData();
      }

      if (!user) return [];
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Account[];
    },
    enabled: !!(user || isDemo),
  });

  const createAccount = useMutation({
    mutationFn: async (newAccount: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (isDemo) {
        showDemoSavePrompt();
        // Simulate success for demo
        return { id: `demo-${Date.now()}`, ...newAccount, user_id: 'demo', created_at: new Date().toISOString() };
      }

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('accounts')
        .insert([{ ...newAccount, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      }
      toast({
        title: "Success",
        description: "Account created successfully",
      });
    },
    onError: (error) => {
      if (!isDemo) {
        toast({
          title: "Error",
          description: "Failed to create account",
          variant: "destructive",
        });
        console.error('Create account error:', error);
      }
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      if (isDemo) {
        showDemoSavePrompt();
        return { id, ...updates };
      }

      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      }
      toast({
        title: "Success",
        description: "Account updated successfully",
      });
    },
    onError: () => {
      if (!isDemo) {
        toast({
          title: "Error",
          description: "Failed to update account",
          variant: "destructive",
        });
      }
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) {
        showDemoSavePrompt();
        return;
      }

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      if (!isDemo) {
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
      }
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    },
    onError: () => {
      if (!isDemo) {
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive",
        });
      }
    },
  });

  return {
    accounts,
    isLoading: isDemo ? false : isLoading,
    error: isDemo ? null : error,
    createAccount,
    updateAccount,
    deleteAccount,
  };
};
