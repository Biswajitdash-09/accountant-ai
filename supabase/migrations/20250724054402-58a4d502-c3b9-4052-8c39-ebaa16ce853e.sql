
-- Create revenue_streams table to track different revenue sources
CREATE TABLE public.revenue_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  business_entity_id UUID REFERENCES public.business_entities(id),
  stream_name TEXT NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('sales', 'donations', 'loans', 'grants', 'other')),
  description TEXT,
  target_amount NUMERIC(12,2),
  actual_amount NUMERIC(12,2) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_templates table for budget planning
CREATE TABLE public.budget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  business_entity_id UUID REFERENCES public.business_entities(id),
  template_name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('personal', 'family', 'business', 'project')),
  income_categories JSONB DEFAULT '[]',
  expense_categories JSONB DEFAULT '[]',
  budget_period TEXT NOT NULL CHECK (budget_period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  total_income NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_goals table
CREATE TABLE public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  business_entity_id UUID REFERENCES public.business_entities(id),
  goal_name TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('savings', 'investment', 'debt_reduction', 'revenue', 'expense_reduction')),
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  target_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description TEXT,
  is_achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create balance_sheet_items table
CREATE TABLE public.balance_sheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  business_entity_id UUID REFERENCES public.business_entities(id),
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('current_asset', 'fixed_asset', 'current_liability', 'long_term_liability', 'equity')),
  category TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  valuation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_sheet_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for revenue_streams
CREATE POLICY "Users can view their own revenue streams" ON public.revenue_streams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own revenue streams" ON public.revenue_streams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue streams" ON public.revenue_streams
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue streams" ON public.revenue_streams
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for budget_templates
CREATE POLICY "Users can view their own budget templates" ON public.budget_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget templates" ON public.budget_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget templates" ON public.budget_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget templates" ON public.budget_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for financial_goals
CREATE POLICY "Users can view their own financial goals" ON public.financial_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own financial goals" ON public.financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial goals" ON public.financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial goals" ON public.financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for balance_sheet_items
CREATE POLICY "Users can view their own balance sheet items" ON public.balance_sheet_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance sheet items" ON public.balance_sheet_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance sheet items" ON public.balance_sheet_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own balance sheet items" ON public.balance_sheet_items
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_revenue_streams_updated_at
  BEFORE UPDATE ON public.revenue_streams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_templates_updated_at
  BEFORE UPDATE ON public.budget_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_balance_sheet_items_updated_at
  BEFORE UPDATE ON public.balance_sheet_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add enhanced transaction categories
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS revenue_stream_id UUID REFERENCES public.revenue_streams(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cost_center TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_revenue_streams_user_type ON public.revenue_streams(user_id, stream_type);
CREATE INDEX IF NOT EXISTS idx_budget_templates_user_type ON public.budget_templates(user_id, template_type);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_type ON public.financial_goals(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_balance_sheet_user_type ON public.balance_sheet_items(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_transactions_revenue_stream ON public.transactions(revenue_stream_id);
