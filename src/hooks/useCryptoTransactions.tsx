import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CryptoTransaction {
  id: string;
  wallet_id: string;
  transaction_hash: string;
  from_address: string;
  to_address: string;
  value: number;
  token_symbol: string;
  transaction_type: string;
  timestamp: string;
  gas_fee: number;
  status: string;
}

export const useCryptoTransactions = (walletId?: string) => {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['crypto_transactions', walletId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('crypto_transactions')
        .select(`
          *,
          crypto_wallets!inner(user_id, wallet_address)
        `)
        .eq('crypto_wallets.user_id', user.id);

      if (walletId) {
        query = query.eq('wallet_id', walletId);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: true,
  });

  return {
    transactions,
    isLoading,
  };
};
