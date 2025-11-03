-- Create crypto_wallets table
CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL DEFAULT 'metamask',
  blockchain TEXT NOT NULL DEFAULT 'ethereum',
  is_primary BOOLEAN DEFAULT false,
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_wallet_address UNIQUE(wallet_address)
);

-- Create crypto_holdings table
CREATE TABLE IF NOT EXISTS public.crypto_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_wallets(id) ON DELETE CASCADE,
  token_symbol TEXT NOT NULL,
  token_name TEXT NOT NULL,
  token_address TEXT,
  balance NUMERIC NOT NULL DEFAULT 0,
  value_usd NUMERIC NOT NULL DEFAULT 0,
  last_price_usd NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create crypto_transactions table
CREATE TABLE IF NOT EXISTS public.crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_wallets(id) ON DELETE CASCADE,
  transaction_hash TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  token_symbol TEXT,
  transaction_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  gas_fee NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_transaction_hash UNIQUE(transaction_hash)
);

-- Create crypto_nfts table
CREATE TABLE IF NOT EXISTS public.crypto_nfts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.crypto_wallets(id) ON DELETE CASCADE,
  token_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  name TEXT,
  collection TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  floor_price_usd NUMERIC,
  acquired_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_nft UNIQUE(token_address, token_id)
);

-- Enable RLS on all tables
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_nfts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crypto_wallets
CREATE POLICY "Users can view their own wallets"
  ON public.crypto_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets"
  ON public.crypto_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
  ON public.crypto_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets"
  ON public.crypto_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for crypto_holdings
CREATE POLICY "Users can view their wallet holdings"
  ON public.crypto_holdings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crypto_wallets
    WHERE crypto_wallets.id = crypto_holdings.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  ));

CREATE POLICY "System can manage holdings"
  ON public.crypto_holdings FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for crypto_transactions
CREATE POLICY "Users can view their wallet transactions"
  ON public.crypto_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crypto_wallets
    WHERE crypto_wallets.id = crypto_transactions.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  ));

CREATE POLICY "System can manage transactions"
  ON public.crypto_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for crypto_nfts
CREATE POLICY "Users can view their wallet NFTs"
  ON public.crypto_nfts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crypto_wallets
    WHERE crypto_wallets.id = crypto_nfts.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  ));

CREATE POLICY "System can manage NFTs"
  ON public.crypto_nfts FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at triggers
CREATE TRIGGER update_crypto_wallets_updated_at
  BEFORE UPDATE ON public.crypto_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_holdings_updated_at
  BEFORE UPDATE ON public.crypto_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crypto_nfts_updated_at
  BEFORE UPDATE ON public.crypto_nfts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();