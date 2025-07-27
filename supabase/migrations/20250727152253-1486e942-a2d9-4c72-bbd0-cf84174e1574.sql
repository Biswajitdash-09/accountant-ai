
-- Create exchange_rates table for currency conversion
CREATE TABLE public.exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base text NOT NULL,
  quote text NOT NULL,
  rate numeric(18,8) NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(base, quote)
);

-- Enable RLS (making it readable by all authenticated users)
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exchange rates" 
  ON public.exchange_rates 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create index for efficient querying
CREATE INDEX idx_exchange_rates_base_quote ON public.exchange_rates(base, quote);
CREATE INDEX idx_exchange_rates_fetched ON public.exchange_rates(fetched_at DESC);

-- Create RPC function to get user crypto assets with enriched data
CREATE OR REPLACE FUNCTION get_user_crypto_assets(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  symbol text,
  quantity numeric,
  avg_buy_price numeric,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.user_id,
    ca.symbol,
    ca.quantity,
    ca.avg_buy_price,
    ca.created_at
  FROM crypto_assets ca
  WHERE ca.user_id = p_user_id;
END;
$$;
