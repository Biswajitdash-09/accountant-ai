
-- First, let's create the missing tables and enhance existing ones

-- Create cost_centers table
CREATE TABLE public.cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  budget_allocation NUMERIC(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  budget_period TEXT NOT NULL CHECK (budget_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget NUMERIC(12,2) NOT NULL,
  actual_spent NUMERIC(12,2) DEFAULT 0,
  categories JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create currencies table for multi-currency support
CREATE TABLE public.currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate NUMERIC(12,6) DEFAULT 1.0,
  is_base BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default currencies
INSERT INTO public.currencies (code, name, symbol, exchange_rate, is_base) VALUES
('USD', 'US Dollar', '$', 1.0, true),
('EUR', 'Euro', '€', 0.85, false),
('GBP', 'British Pound', '£', 0.73, false),
('INR', 'Indian Rupee', '₹', 82.50, false),
('JPY', 'Japanese Yen', '¥', 110.0, false),
('CAD', 'Canadian Dollar', 'C$', 1.25, false),
('AUD', 'Australian Dollar', 'A$', 1.35, false);

-- Create user_preferences table for settings
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  default_currency_id UUID REFERENCES public.currencies(id),
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  fiscal_year_start DATE DEFAULT '2024-01-01',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhance existing tables with currency support
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS currency_id UUID REFERENCES public.currencies(id);
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS currency_id UUID REFERENCES public.currencies(id);
ALTER TABLE public.revenue_streams ADD COLUMN IF NOT EXISTS currency_id UUID REFERENCES public.currencies(id);
ALTER TABLE public.financial_goals ADD COLUMN IF NOT EXISTS currency_id UUID REFERENCES public.currencies(id);
ALTER TABLE public.balance_sheet_items ADD COLUMN IF NOT EXISTS currency_id UUID REFERENCES public.currencies(id);

-- Add cost_center_id to transactions if not exists
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cost_center_id UUID REFERENCES public.cost_centers(id);

-- Add RLS policies for new tables
ALTER TABLE public.cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Cost centers policies
CREATE POLICY "Users can view their own cost centers" ON public.cost_centers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cost centers" ON public.cost_centers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cost centers" ON public.cost_centers
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cost centers" ON public.cost_centers
  FOR DELETE USING (auth.uid() = user_id);

-- Budget policies
CREATE POLICY "Users can view their own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Currencies policies (allow all users to read)
CREATE POLICY "Anyone can view currencies" ON public.currencies
  FOR SELECT USING (true);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cost_centers_user_id ON public.cost_centers(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON public.budgets(budget_period, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_transactions_cost_center ON public.transactions(cost_center_id);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON public.transactions(currency_id);

-- Add updated_at triggers
CREATE TRIGGER update_cost_centers_updated_at
  BEFORE UPDATE ON public.cost_centers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at
  BEFORE UPDATE ON public.currencies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
