
-- Create tax periods table
CREATE TABLE public.tax_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  period_type TEXT NOT NULL CHECK (period_type IN ('quarterly', 'annual')),
  tax_year INTEGER NOT NULL,
  quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'filed', 'extended', 'closed')),
  estimated_tax_due NUMERIC DEFAULT 0,
  actual_tax_due NUMERIC DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax forms table
CREATE TABLE public.tax_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  tax_period_id UUID NOT NULL,
  form_type TEXT NOT NULL,
  form_name TEXT NOT NULL,
  form_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'filed', 'amended')),
  due_date DATE,
  filed_date DATE,
  confirmation_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax deductions table
CREATE TABLE public.tax_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  tax_period_id UUID NOT NULL,
  transaction_id UUID,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency_id UUID,
  deduction_type TEXT NOT NULL CHECK (deduction_type IN ('business_expense', 'home_office', 'travel', 'meals', 'equipment', 'professional_services', 'other')),
  is_approved BOOLEAN DEFAULT false,
  supporting_documents JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax payments table
CREATE TABLE public.tax_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  tax_period_id UUID NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('estimated', 'extension', 'balance_due', 'refund')),
  amount NUMERIC NOT NULL,
  currency_id UUID,
  payment_date DATE NOT NULL,
  due_date DATE,
  payment_method TEXT,
  confirmation_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax calculations table
CREATE TABLE public.tax_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  tax_period_id UUID NOT NULL,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('estimated', 'final', 'amended')),
  gross_income NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  taxable_income NUMERIC DEFAULT 0,
  tax_liability NUMERIC DEFAULT 0,
  credits_applied NUMERIC DEFAULT 0,
  amount_owed NUMERIC DEFAULT 0,
  calculation_details JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax documents table
CREATE TABLE public.tax_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  tax_period_id UUID,
  document_id UUID NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('receipt', 'invoice', 'form', 'statement', 'other')),
  tax_purpose TEXT NOT NULL,
  deduction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax settings table
CREATE TABLE public.tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  tax_year_start DATE DEFAULT '2024-01-01',
  filing_status TEXT DEFAULT 'single',
  business_type TEXT DEFAULT 'sole_proprietorship',
  tax_id_number TEXT,
  state_tax_id TEXT,
  quarterly_filing BOOLEAN DEFAULT true,
  auto_categorize_expenses BOOLEAN DEFAULT true,
  default_deduction_categories JSONB DEFAULT '[]',
  notification_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.tax_periods ADD CONSTRAINT fk_tax_periods_business_entity 
  FOREIGN KEY (business_entity_id) REFERENCES public.business_entities(id);

ALTER TABLE public.tax_forms ADD CONSTRAINT fk_tax_forms_business_entity 
  FOREIGN KEY (business_entity_id) REFERENCES public.business_entities(id);
ALTER TABLE public.tax_forms ADD CONSTRAINT fk_tax_forms_tax_period 
  FOREIGN KEY (tax_period_id) REFERENCES public.tax_periods(id);

ALTER TABLE public.tax_deductions ADD CONSTRAINT fk_tax_deductions_business_entity 
  FOREIGN KEY (business_entity_id) REFERENCES public.business_entities(id);
ALTER TABLE public.tax_deductions ADD CONSTRAINT fk_tax_deductions_tax_period 
  FOREIGN KEY (tax_period_id) REFERENCES public.tax_periods(id);
ALTER TABLE public.tax_deductions ADD CONSTRAINT fk_tax_deductions_transaction 
  FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);
ALTER TABLE public.tax_deductions ADD CONSTRAINT fk_tax_deductions_currency 
  FOREIGN KEY (currency_id) REFERENCES public.currencies(id);

ALTER TABLE public.tax_payments ADD CONSTRAINT fk_tax_payments_business_entity 
  FOREIGN KEY (business_entity_id) REFERENCES public.business_entities(id);
ALTER TABLE public.tax_payments ADD CONSTRAINT fk_tax_payments_tax_period 
  FOREIGN KEY (tax_period_id) REFERENCES public.tax_periods(id);
ALTER TABLE public.tax_payments ADD CONSTRAINT fk_tax_payments_currency 
  FOREIGN KEY (currency_id) REFERENCES public.currencies(id);

ALTER TABLE public.tax_calculations ADD CONSTRAINT fk_tax_calculations_business_entity 
  FOREIGN KEY (business_entity_id) REFERENCES public.business_entities(id);
ALTER TABLE public.tax_calculations ADD CONSTRAINT fk_tax_calculations_tax_period 
  FOREIGN KEY (tax_period_id) REFERENCES public.tax_periods(id);

ALTER TABLE public.tax_documents ADD CONSTRAINT fk_tax_documents_business_entity 
  FOREIGN KEY (business_entity_id) REFERENCES public.business_entities(id);
ALTER TABLE public.tax_documents ADD CONSTRAINT fk_tax_documents_tax_period 
  FOREIGN KEY (tax_period_id) REFERENCES public.tax_periods(id);
ALTER TABLE public.tax_documents ADD CONSTRAINT fk_tax_documents_document 
  FOREIGN KEY (document_id) REFERENCES public.documents(id);
ALTER TABLE public.tax_documents ADD CONSTRAINT fk_tax_documents_deduction 
  FOREIGN KEY (deduction_id) REFERENCES public.tax_deductions(id);

ALTER TABLE public.tax_settings ADD CONSTRAINT fk_tax_settings_business_entity 
  FOREIGN KEY (business_entity_id) REFERENCES public.business_entities(id);

-- Enable RLS on all tax tables
ALTER TABLE public.tax_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tax_periods
CREATE POLICY "Users can view their own tax periods" ON public.tax_periods
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax periods" ON public.tax_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax periods" ON public.tax_periods
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax periods" ON public.tax_periods
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tax_forms
CREATE POLICY "Users can view their own tax forms" ON public.tax_forms
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax forms" ON public.tax_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax forms" ON public.tax_forms
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax forms" ON public.tax_forms
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tax_deductions
CREATE POLICY "Users can view their own tax deductions" ON public.tax_deductions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax deductions" ON public.tax_deductions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax deductions" ON public.tax_deductions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax deductions" ON public.tax_deductions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tax_payments
CREATE POLICY "Users can view their own tax payments" ON public.tax_payments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax payments" ON public.tax_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax payments" ON public.tax_payments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax payments" ON public.tax_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tax_calculations
CREATE POLICY "Users can view their own tax calculations" ON public.tax_calculations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax calculations" ON public.tax_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax calculations" ON public.tax_calculations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax calculations" ON public.tax_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tax_documents
CREATE POLICY "Users can view their own tax documents" ON public.tax_documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax documents" ON public.tax_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax documents" ON public.tax_documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax documents" ON public.tax_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for tax_settings
CREATE POLICY "Users can view their own tax settings" ON public.tax_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax settings" ON public.tax_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax settings" ON public.tax_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax settings" ON public.tax_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_tax_periods_user_id ON public.tax_periods(user_id);
CREATE INDEX idx_tax_periods_tax_year ON public.tax_periods(tax_year);
CREATE INDEX idx_tax_forms_user_id ON public.tax_forms(user_id);
CREATE INDEX idx_tax_forms_tax_period_id ON public.tax_forms(tax_period_id);
CREATE INDEX idx_tax_deductions_user_id ON public.tax_deductions(user_id);
CREATE INDEX idx_tax_deductions_tax_period_id ON public.tax_deductions(tax_period_id);
CREATE INDEX idx_tax_payments_user_id ON public.tax_payments(user_id);
CREATE INDEX idx_tax_payments_tax_period_id ON public.tax_payments(tax_period_id);
CREATE INDEX idx_tax_calculations_user_id ON public.tax_calculations(user_id);
CREATE INDEX idx_tax_calculations_tax_period_id ON public.tax_calculations(tax_period_id);
CREATE INDEX idx_tax_documents_user_id ON public.tax_documents(user_id);
CREATE INDEX idx_tax_documents_tax_period_id ON public.tax_documents(tax_period_id);
CREATE INDEX idx_tax_settings_user_id ON public.tax_settings(user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_tax_periods_updated_at
    BEFORE UPDATE ON public.tax_periods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_forms_updated_at
    BEFORE UPDATE ON public.tax_forms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_deductions_updated_at
    BEFORE UPDATE ON public.tax_deductions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_payments_updated_at
    BEFORE UPDATE ON public.tax_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_calculations_updated_at
    BEFORE UPDATE ON public.tax_calculations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_documents_updated_at
    BEFORE UPDATE ON public.tax_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tax_settings_updated_at
    BEFORE UPDATE ON public.tax_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add tax-related deadline types
INSERT INTO public.deadlines (user_id, title, description, deadline_type, deadline_date, priority, status)
SELECT 
    auth.uid(),
    'Quarterly Tax Filing - Q1',
    'File quarterly tax return for Q1',
    'tax_quarterly',
    '2025-04-15',
    'high',
    'pending'
WHERE auth.uid() IS NOT NULL;

-- Add tax-related categories for transactions
UPDATE public.transactions 
SET category = 'Business Expense'
WHERE category IS NULL AND type = 'expense' AND user_id = auth.uid();
