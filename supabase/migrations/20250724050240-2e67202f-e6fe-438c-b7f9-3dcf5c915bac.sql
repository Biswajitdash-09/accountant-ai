
-- Create business_entities table
CREATE TABLE public.business_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  tax_id TEXT,
  entity_type TEXT NOT NULL,
  address JSONB,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on business_entities table
ALTER TABLE public.business_entities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for business_entities
CREATE POLICY "Users can view their own business entities" ON public.business_entities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business entities" ON public.business_entities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business entities" ON public.business_entities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business entities" ON public.business_entities
  FOR DELETE USING (auth.uid() = user_id);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create recurring_transactions table
CREATE TABLE public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  template_data JSONB NOT NULL,
  frequency TEXT NOT NULL,
  next_run_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on recurring_transactions table
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recurring_transactions
CREATE POLICY "Users can view their own recurring transactions" ON public.recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions" ON public.recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" ON public.recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" ON public.recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create analytics_cache table
CREATE TABLE public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  cache_key TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on analytics_cache table
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics_cache
CREATE POLICY "Users can view their own analytics cache" ON public.analytics_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics cache" ON public.analytics_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics cache" ON public.analytics_cache
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics cache" ON public.analytics_cache
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_business_entities_updated_at
  BEFORE UPDATE ON public.business_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at
  BEFORE UPDATE ON public.recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update documents table to add version control and improve categorization
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS parent_document_id UUID REFERENCES public.documents(id);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS ai_confidence NUMERIC(3,2);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending';

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_documents_extracted_text ON public.documents USING gin(to_tsvector('english', extracted_text));
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON public.documents USING gin(tags);
