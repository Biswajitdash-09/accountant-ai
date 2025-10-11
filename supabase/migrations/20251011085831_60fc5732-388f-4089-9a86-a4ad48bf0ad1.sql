-- Create investment tracking tables

-- User investments tracking
CREATE TABLE public.user_investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  investment_type text NOT NULL CHECK (investment_type IN ('stock', 'crypto', 'real_estate', 'bonds', 'mutual_funds', 'etf', 'other')),
  symbol text,
  name text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  purchase_price numeric NOT NULL CHECK (purchase_price >= 0),
  purchase_date date NOT NULL,
  current_value numeric,
  currency_id uuid REFERENCES public.currencies(id),
  last_updated timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Investment alerts and reminders
CREATE TABLE public.investment_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  investment_id uuid REFERENCES public.user_investments(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('dividend', 'rebalance', 'underperforming', 'overperforming', 'maturity', 'reminder')),
  alert_date date NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  is_dismissed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tax optimization records
CREATE TABLE public.tax_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  strategy_type text NOT NULL,
  description text NOT NULL,
  estimated_savings numeric CHECK (estimated_savings >= 0),
  implementation_date date,
  status text DEFAULT 'suggested' CHECK (status IN ('suggested', 'implemented', 'rejected', 'pending')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_investments
CREATE POLICY "Users can view their own investments"
  ON public.user_investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
  ON public.user_investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
  ON public.user_investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
  ON public.user_investments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for investment_alerts
CREATE POLICY "Users can view their own alerts"
  ON public.investment_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
  ON public.investment_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.investment_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.investment_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tax_strategies
CREATE POLICY "Users can view their own tax strategies"
  ON public.tax_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax strategies"
  ON public.tax_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax strategies"
  ON public.tax_strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax strategies"
  ON public.tax_strategies FOR DELETE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_investments_updated_at
  BEFORE UPDATE ON public.user_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_strategies_updated_at
  BEFORE UPDATE ON public.tax_strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_user_investments_user_id ON public.user_investments(user_id);
CREATE INDEX idx_user_investments_type ON public.user_investments(investment_type);
CREATE INDEX idx_investment_alerts_user_id ON public.investment_alerts(user_id);
CREATE INDEX idx_investment_alerts_unread ON public.investment_alerts(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_tax_strategies_user_id ON public.tax_strategies(user_id);
CREATE INDEX idx_tax_strategies_status ON public.tax_strategies(user_id, status);