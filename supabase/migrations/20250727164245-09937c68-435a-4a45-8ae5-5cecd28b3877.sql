
-- Create crypto_assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.crypto_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  symbol TEXT NOT NULL,
  quantity DECIMAL NOT NULL DEFAULT 0,
  avg_buy_price DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crypto_prices table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.crypto_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  price DECIMAL NOT NULL DEFAULT 0,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(symbol, fetched_at)
);

-- Create exchange_rates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base TEXT NOT NULL,
  quote TEXT NOT NULL,
  rate DECIMAL NOT NULL DEFAULT 0,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(base, quote, fetched_at)
);

-- Add RLS policies for crypto_assets
ALTER TABLE public.crypto_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own crypto assets" ON public.crypto_assets;
CREATE POLICY "Users can view their own crypto assets" 
  ON public.crypto_assets 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own crypto assets" ON public.crypto_assets;
CREATE POLICY "Users can create their own crypto assets" 
  ON public.crypto_assets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own crypto assets" ON public.crypto_assets;
CREATE POLICY "Users can update their own crypto assets" 
  ON public.crypto_assets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own crypto assets" ON public.crypto_assets;
CREATE POLICY "Users can delete their own crypto assets" 
  ON public.crypto_assets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for crypto_prices (public read)
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view crypto prices" ON public.crypto_prices;
CREATE POLICY "Anyone can view crypto prices" 
  ON public.crypto_prices 
  FOR SELECT 
  USING (true);

-- Add RLS policies for exchange_rates (public read)
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view exchange rates" ON public.exchange_rates;
CREATE POLICY "Anyone can view exchange rates" 
  ON public.exchange_rates 
  FOR SELECT 
  USING (true);

-- Create RPC function to get user crypto assets with current prices
CREATE OR REPLACE FUNCTION get_user_crypto_assets(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  symbol TEXT,
  quantity DECIMAL,
  avg_buy_price DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.symbol,
    ca.quantity,
    ca.avg_buy_price,
    ca.created_at,
    ca.updated_at
  FROM crypto_assets ca
  WHERE ca.user_id = p_user_id
  ORDER BY ca.created_at DESC;
END;
$$;
