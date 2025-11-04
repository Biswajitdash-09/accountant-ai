import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CryptoNFT {
  id: string;
  wallet_id: string;
  token_address: string;
  token_id: string;
  name: string;
  collection: string;
  metadata: any;
  image_url?: string;
  floor_price_usd?: number;
  acquired_at: string;
}

export const useCryptoNFTs = (walletId?: string) => {
  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ['crypto_nfts', walletId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('crypto_nfts')
        .select(`
          *,
          crypto_wallets!inner(user_id, wallet_address)
        `)
        .eq('crypto_wallets.user_id', user.id);

      if (walletId) {
        query = query.eq('wallet_id', walletId);
      }

      const { data, error } = await query.order('acquired_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: true,
  });

  const totalFloorValue = nfts.reduce((sum, nft) => sum + (nft.floor_price_usd || 0), 0);

  return {
    nfts,
    isLoading,
    totalFloorValue,
  };
};
