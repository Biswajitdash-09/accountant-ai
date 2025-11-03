import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CryptoWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  wallet_type: string;
  blockchain: string;
  is_primary: boolean;
  connected_at: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export const useCryptoWallets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['crypto_wallets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('crypto_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      return data as CryptoWallet[];
    },
  });

  const connectWallet = useMutation({
    mutationFn: async ({ 
      walletAddress, 
      walletType, 
      blockchain 
    }: { 
      walletAddress: string; 
      walletType: string; 
      blockchain: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('moralis-connect-wallet', {
        body: { walletAddress, walletType, blockchain }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to connect wallet');
      
      return data.wallet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto_wallets'] });
      toast({
        title: "Wallet Connected",
        description: "Your crypto wallet has been connected successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectWallet = useMutation({
    mutationFn: async (walletId: string) => {
      const { error } = await supabase
        .from('crypto_wallets')
        .delete()
        .eq('id', walletId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto_wallets'] });
      toast({
        title: "Wallet Disconnected",
        description: "Your crypto wallet has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to disconnect wallet.",
        variant: "destructive",
      });
    },
  });

  const setPrimaryWallet = useMutation({
    mutationFn: async (walletId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Set all wallets to non-primary
      await supabase
        .from('crypto_wallets')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Set selected wallet as primary
      const { error } = await supabase
        .from('crypto_wallets')
        .update({ is_primary: true })
        .eq('id', walletId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crypto_wallets'] });
      toast({
        title: "Primary Wallet Set",
        description: "Your primary wallet has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set primary wallet.",
        variant: "destructive",
      });
    },
  });

  const syncPortfolio = useMutation({
    mutationFn: async (walletId: string) => {
      const { data, error } = await supabase.functions.invoke('moralis-sync-portfolio', {
        body: { walletId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync portfolio');
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crypto_wallets'] });
      queryClient.invalidateQueries({ queryKey: ['crypto_holdings'] });
      toast({
        title: "Portfolio Synced",
        description: data.message || "Your portfolio has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    wallets,
    isLoading,
    connectWallet,
    disconnectWallet,
    setPrimaryWallet,
    syncPortfolio,
  };
};
