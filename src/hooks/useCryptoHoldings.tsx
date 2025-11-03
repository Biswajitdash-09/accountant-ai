import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CryptoHolding {
  id: string;
  wallet_id: string;
  token_symbol: string;
  token_name: string;
  token_address?: string;
  balance: number;
  value_usd: number;
  last_price_usd: number;
  created_at: string;
  updated_at: string;
}

export const useCryptoHoldings = (walletId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['crypto_holdings', walletId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('crypto_holdings')
        .select(`
          *,
          crypto_wallets!inner(user_id, wallet_address, blockchain)
        `)
        .eq('crypto_wallets.user_id', user.id);

      if (walletId) {
        query = query.eq('wallet_id', walletId);
      }

      const { data, error } = await query.order('value_usd', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: true,
  });

  const syncTransactions = useMutation({
    mutationFn: async (walletId: string) => {
      const { data, error } = await supabase.functions.invoke('moralis-sync-transactions', {
        body: { walletId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync transactions');
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crypto_transactions'] });
      toast({
        title: "Transactions Synced",
        description: data.message || "Your transactions have been updated.",
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

  const syncNFTs = useMutation({
    mutationFn: async (walletId: string) => {
      const { data, error } = await supabase.functions.invoke('moralis-sync-nfts', {
        body: { walletId }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync NFTs');
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crypto_nfts'] });
      toast({
        title: "NFTs Synced",
        description: data.message || "Your NFTs have been updated.",
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

  const totalValue = holdings.reduce((sum, holding) => sum + (holding.value_usd || 0), 0);

  return {
    holdings,
    isLoading,
    totalValue,
    syncTransactions,
    syncNFTs,
  };
};
