
-- Create crypto_assets table
CREATE TABLE public.crypto_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  quantity numeric(24,10) NOT NULL,
  avg_buy_price numeric(18,8) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crypto_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for crypto_assets
CREATE POLICY "Users can view their own crypto assets" 
  ON public.crypto_assets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto assets" 
  ON public.crypto_assets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crypto assets" 
  ON public.crypto_assets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crypto assets" 
  ON public.crypto_assets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create crypto_prices table
CREATE TABLE public.crypto_prices (
  id bigserial PRIMARY KEY,
  symbol text NOT NULL,
  price numeric(18,8) NOT NULL,
  fetched_at timestamptz NOT NULL
);

-- Enable RLS (making it readable by all authenticated users)
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view crypto prices" 
  ON public.crypto_prices 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create index for efficient querying
CREATE INDEX idx_crypto_prices_symbol_fetched ON public.crypto_prices(symbol, fetched_at DESC);
