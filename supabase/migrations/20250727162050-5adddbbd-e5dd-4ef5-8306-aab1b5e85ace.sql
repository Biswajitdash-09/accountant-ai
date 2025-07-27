
-- Create tax calendar events table
CREATE TABLE public.tax_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  business_entity_id UUID REFERENCES public.business_entities(id),
  event_title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('quarterly_payment', 'annual_filing', 'estimated_payment', 'document_deadline', 'custom')),
  event_date DATE NOT NULL,
  due_date DATE NOT NULL,
  description TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
  reminder_days INTEGER[] DEFAULT ARRAY[30, 7, 1],
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tax settings table (enhanced)
CREATE TABLE public.tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  business_entity_id UUID REFERENCES public.business_entities(id),
  tax_year_start DATE NOT NULL DEFAULT (CURRENT_DATE - INTERVAL '1 year' + INTERVAL '1 day'),
  filing_status TEXT NOT NULL DEFAULT 'single' CHECK (filing_status IN ('single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow')),
  business_type TEXT NOT NULL DEFAULT 'sole_proprietorship' CHECK (business_type IN ('sole_proprietorship', 'partnership', 'llc', 's_corp', 'c_corp')),
  tax_id_number TEXT,
  state_tax_id TEXT,
  quarterly_filing BOOLEAN DEFAULT false,
  auto_categorize_expenses BOOLEAN DEFAULT true,
  default_deduction_categories JSONB DEFAULT '["office_supplies", "travel", "meals", "utilities", "professional_services"]',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false, "deadline_reminders": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_entity_id)
);

-- Add RLS for tax calendar events
ALTER TABLE public.tax_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tax calendar events" 
  ON public.tax_calendar_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax calendar events" 
  ON public.tax_calendar_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax calendar events" 
  ON public.tax_calendar_events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax calendar events" 
  ON public.tax_calendar_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS for tax settings (update existing or create new)
DO $$
BEGIN
  -- Check if tax_settings table exists and has RLS enabled
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tax_settings' AND table_schema = 'public') THEN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tax_settings' AND rowsecurity = true) THEN
      ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own tax settings" ON public.tax_settings;
    DROP POLICY IF EXISTS "Users can create their own tax settings" ON public.tax_settings;
    DROP POLICY IF EXISTS "Users can update their own tax settings" ON public.tax_settings;
    DROP POLICY IF EXISTS "Users can delete their own tax settings" ON public.tax_settings;
  END IF;
END $$;

-- Create/recreate tax settings policies
CREATE POLICY "Users can view their own tax settings" 
  ON public.tax_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax settings" 
  ON public.tax_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax settings" 
  ON public.tax_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax settings" 
  ON public.tax_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_tax_calendar_events_updated_at
  BEFORE UPDATE ON public.tax_calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at
  BEFORE UPDATE ON public.tax_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default tax calendar events for new users
CREATE OR REPLACE FUNCTION create_default_tax_calendar(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Q1 Estimated Tax Payment
  INSERT INTO public.tax_calendar_events (user_id, event_title, event_type, event_date, due_date, description)
  VALUES (p_user_id, 'Q1 Estimated Tax Payment', 'quarterly_payment', 
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '3 months' + INTERVAL '15 days',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '3 months' + INTERVAL '15 days',
          'First quarter estimated tax payment due');
          
  -- Q2 Estimated Tax Payment  
  INSERT INTO public.tax_calendar_events (user_id, event_title, event_type, event_date, due_date, description)
  VALUES (p_user_id, 'Q2 Estimated Tax Payment', 'quarterly_payment',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '6 months' + INTERVAL '15 days',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '6 months' + INTERVAL '15 days',
          'Second quarter estimated tax payment due');
          
  -- Q3 Estimated Tax Payment
  INSERT INTO public.tax_calendar_events (user_id, event_title, event_type, event_date, due_date, description)
  VALUES (p_user_id, 'Q3 Estimated Tax Payment', 'quarterly_payment',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months' + INTERVAL '15 days',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '9 months' + INTERVAL '15 days',
          'Third quarter estimated tax payment due');
          
  -- Q4 Estimated Tax Payment
  INSERT INTO public.tax_calendar_events (user_id, event_title, event_type, event_date, due_date, description)
  VALUES (p_user_id, 'Q4 Estimated Tax Payment', 'quarterly_payment',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' + INTERVAL '15 days',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' + INTERVAL '15 days',
          'Fourth quarter estimated tax payment due');
          
  -- Annual Tax Filing
  INSERT INTO public.tax_calendar_events (user_id, event_title, event_type, event_date, due_date, description)
  VALUES (p_user_id, 'Annual Tax Return Filing', 'annual_filing',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' + INTERVAL '3 months' + INTERVAL '15 days',
          DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' + INTERVAL '3 months' + INTERVAL '15 days',
          'Annual tax return filing deadline');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
