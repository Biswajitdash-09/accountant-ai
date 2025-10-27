-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.exchange_rates CASCADE;
DROP TABLE IF EXISTS public.crypto_prices CASCADE;
DROP TABLE IF EXISTS public.investment_portfolio CASCADE;

-- Create exchange rates table for real-time currency conversion
CREATE TABLE public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency_id UUID NOT NULL REFERENCES public.currencies(id),
  target_currency_id UUID NOT NULL REFERENCES public.currencies(id),
  rate DECIMAL(20, 10) NOT NULL,
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(base_currency_id, target_currency_id, rate_date)
);

-- Create crypto prices table for cryptocurrency tracking
CREATE TABLE public.crypto_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  name TEXT,
  price_usd DECIMAL(20, 10) NOT NULL,
  price_change_24h DECIMAL(10, 4),
  market_cap DECIMAL(30, 2),
  volume_24h DECIMAL(30, 2),
  last_updated TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(symbol, last_updated)
);

-- Create investment portfolio table
CREATE TABLE public.investment_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'crypto', 'bond', 'fund', 'etf', 'other')),
  symbol TEXT NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,
  purchase_price DECIMAL(20, 4) NOT NULL,
  purchase_date DATE NOT NULL,
  currency_id UUID REFERENCES public.currencies(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchange_rates (public read, service role write)
CREATE POLICY "Exchange rates are viewable by everyone"
  ON public.exchange_rates FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage exchange rates"
  ON public.exchange_rates FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for crypto_prices (public read)
CREATE POLICY "Crypto prices are viewable by everyone"
  ON public.crypto_prices FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage crypto prices"
  ON public.crypto_prices FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for investment_portfolio
CREATE POLICY "Users can view their own investments"
  ON public.investment_portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments"
  ON public.investment_portfolio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
  ON public.investment_portfolio FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
  ON public.investment_portfolio FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_exchange_rates_currencies ON public.exchange_rates(base_currency_id, target_currency_id);
CREATE INDEX idx_exchange_rates_date ON public.exchange_rates(rate_date DESC);
CREATE INDEX idx_crypto_prices_symbol ON public.crypto_prices(symbol);
CREATE INDEX idx_crypto_prices_updated ON public.crypto_prices(last_updated DESC);
CREATE INDEX idx_investment_portfolio_user ON public.investment_portfolio(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investment_portfolio_updated_at
  BEFORE UPDATE ON public.investment_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();