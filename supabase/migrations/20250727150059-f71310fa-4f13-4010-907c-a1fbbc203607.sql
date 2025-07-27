
-- Phase 1: Database Schema Extensions for AI Features

-- 1) Voice entries (voice accounting pipeline)
CREATE TABLE public.voice_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  storage_path text NOT NULL,
  status text CHECK (status IN ('uploaded','processing','done','failed')) DEFAULT 'uploaded',
  transcript text,
  parsed jsonb, -- structured transaction extracted from NLU
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);
ALTER TABLE public.voice_entries ENABLE ROW LEVEL SECURITY;

-- 2) Tax advice sessions + messages (enhanced chat)
CREATE TABLE public.tax_advice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tax_advice_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.tax_advice_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.tax_advice_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tax_advice_messages ENABLE ROW LEVEL SECURITY;

-- 3) Crypto assets and prices
CREATE TABLE public.crypto_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL, -- e.g. BTC, ETH
  name text NOT NULL, -- e.g. Bitcoin, Ethereum
  quantity numeric(24,10) NOT NULL,
  avg_buy_price numeric(18,8),
  total_invested numeric(18,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.crypto_assets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.crypto_prices (
  id bigserial PRIMARY KEY,
  symbol text NOT NULL,
  price numeric(18,8) NOT NULL,
  price_change_24h numeric(8,4),
  market_cap numeric(20,2),
  fetched_at timestamptz DEFAULT now()
);
ALTER TABLE public.crypto_prices ENABLE ROW LEVEL SECURITY;

-- 4) Enhanced exchange rates with more data
ALTER TABLE public.exchange_rates ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.exchange_rates ADD COLUMN IF NOT EXISTS rate_change_24h numeric(8,4);

-- 5) Financial health scores
CREATE TABLE public.health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_score integer CHECK (overall_score BETWEEN 0 AND 100),
  cash_flow_score integer CHECK (cash_flow_score BETWEEN 0 AND 100),
  liquidity_score integer CHECK (liquidity_score BETWEEN 0 AND 100),
  savings_score integer CHECK (savings_score BETWEEN 0 AND 100),
  debt_score integer CHECK (debt_score BETWEEN 0 AND 100),
  investment_score integer CHECK (investment_score BETWEEN 0 AND 100),
  breakdown jsonb DEFAULT '{}',
  recommendations text[],
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

-- 6) Enhanced alerts system
CREATE TABLE public.financial_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'fraud','anomaly','tax_deadline','price_drop','budget_exceeded'
  title text NOT NULL,
  message text NOT NULL,
  severity text CHECK (severity IN ('low','medium','high','critical')) DEFAULT 'medium',
  payload jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.financial_alerts ENABLE ROW LEVEL SECURITY;

-- 7) Enhanced documents table for AI processing
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS ai_confidence numeric(3,2);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS structured_data jsonb;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS vendor_name text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS total_amount numeric(12,2);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS tax_amount numeric(12,2);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS invoice_date date;

-- 8) Transaction enhancements for AI features
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS confidence_score numeric(3,2);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS source_document_id uuid REFERENCES public.documents(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS voice_entry_id uuid REFERENCES public.voice_entries(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_anomaly boolean DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS tags text[];

-- 9) Create RLS policies for new tables
-- Voice entries policies
CREATE POLICY "Users can create their own voice entries" 
  ON public.voice_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own voice entries" 
  ON public.voice_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice entries" 
  ON public.voice_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice entries" 
  ON public.voice_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- Tax advice sessions policies
CREATE POLICY "Users can create their own tax sessions" 
  ON public.tax_advice_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tax sessions" 
  ON public.tax_advice_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax sessions" 
  ON public.tax_advice_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax sessions" 
  ON public.tax_advice_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Tax advice messages policies
CREATE POLICY "Users can create messages in their sessions" 
  ON public.tax_advice_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their sessions" 
  ON public.tax_advice_messages FOR SELECT 
  USING (auth.uid() = user_id);

-- Crypto assets policies
CREATE POLICY "Users can manage their own crypto assets" 
  ON public.crypto_assets FOR ALL 
  USING (auth.uid() = user_id);

-- Crypto prices are readable by all authenticated users
CREATE POLICY "All users can view crypto prices" 
  ON public.crypto_prices FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Health scores policies
CREATE POLICY "Users can manage their own health scores" 
  ON public.health_scores FOR ALL 
  USING (auth.uid() = user_id);

-- Financial alerts policies
CREATE POLICY "Users can manage their own alerts" 
  ON public.financial_alerts FOR ALL 
  USING (auth.uid() = user_id);

-- 10) Create useful views for latest data
CREATE OR REPLACE VIEW public.latest_crypto_prices AS
SELECT DISTINCT ON (symbol)
  symbol, price, price_change_24h, market_cap, fetched_at
FROM public.crypto_prices
ORDER BY symbol, fetched_at DESC;

CREATE OR REPLACE VIEW public.latest_exchange_rates AS
SELECT DISTINCT ON (base, quote)
  base, quote, rate, rate_change_24h, source, updated_at
FROM public.exchange_rates
ORDER BY base, quote, updated_at DESC;

-- 11) Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_entries_user_status ON public.voice_entries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol_time ON public.crypto_prices(symbol, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_tax_sessions_user_time ON public.tax_advice_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_user_unread ON public.financial_alerts(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_scores_user_time ON public.health_scores(user_id, created_at DESC);

-- 12) Add trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crypto_assets_updated_at 
  BEFORE UPDATE ON public.crypto_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_advice_sessions_updated_at 
  BEFORE UPDATE ON public.tax_advice_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
