
-- Phase 6: Enhanced Document Management with AI Processing
CREATE TABLE IF NOT EXISTS public.document_ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL,
  confidence_score NUMERIC(5,2) DEFAULT 0.0,
  extracted_data JSONB DEFAULT '{}',
  suggested_categorization JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 7: Advanced Reporting System
CREATE TABLE IF NOT EXISTS public.custom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  report_config JSONB NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  schedule_config JSONB DEFAULT '{}',
  is_scheduled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.custom_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  execution_status TEXT DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  file_path TEXT,
  error_message TEXT,
  execution_time_ms INTEGER
);

-- Phase 8: Multi-Entity Management
CREATE TABLE IF NOT EXISTS public.entity_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_entity_id UUID REFERENCES public.business_entities(id) ON DELETE CASCADE,
  child_entity_id UUID REFERENCES public.business_entities(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  ownership_percentage NUMERIC(5,2) DEFAULT 100.00,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(parent_entity_id, child_entity_id)
);

CREATE TABLE IF NOT EXISTS public.inter_entity_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_entity_id UUID REFERENCES public.business_entities(id),
  to_entity_id UUID REFERENCES public.business_entities(id),
  transaction_type TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  currency_id UUID,
  description TEXT,
  reference_number TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 9: Advanced Tax Management
CREATE TABLE IF NOT EXISTS public.tax_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  business_entity_id UUID,
  check_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  issues_found JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Phase 10: Collaborative Features
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID REFERENCES public.business_entities(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.collaboration_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL,
  invitee_email TEXT NOT NULL,
  entity_id UUID REFERENCES public.business_entities(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  invite_token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.activity_feeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_id UUID REFERENCES public.business_entities(id),
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  affected_resource_type TEXT,
  affected_resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Phase 11: Advanced Integration & API Management
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  integration_type TEXT NOT NULL,
  connection_name TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  status TEXT DEFAULT 'inactive',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  next_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  sync_type TEXT NOT NULL,
  status TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  sync_details JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Phase 12: Performance Optimization & Caching
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.query_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  cache_key TEXT NOT NULL UNIQUE,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for all new tables
ALTER TABLE public.document_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inter_entity_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_ai_analysis
CREATE POLICY "Users can view their own document AI analysis" ON public.document_ai_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own document AI analysis" ON public.document_ai_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own document AI analysis" ON public.document_ai_analysis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own document AI analysis" ON public.document_ai_analysis FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for custom_reports
CREATE POLICY "Users can view their own custom reports" ON public.custom_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own custom reports" ON public.custom_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own custom reports" ON public.custom_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own custom reports" ON public.custom_reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for report_executions
CREATE POLICY "Users can view their own report executions" ON public.report_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own report executions" ON public.report_executions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own report executions" ON public.report_executions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own report executions" ON public.report_executions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for entity_relationships
CREATE POLICY "Users can view their own entity relationships" ON public.entity_relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own entity relationships" ON public.entity_relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entity relationships" ON public.entity_relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entity relationships" ON public.entity_relationships FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inter_entity_transactions
CREATE POLICY "Users can view their own inter entity transactions" ON public.inter_entity_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own inter entity transactions" ON public.inter_entity_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inter entity transactions" ON public.inter_entity_transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inter entity transactions" ON public.inter_entity_transactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tax_rules
CREATE POLICY "Users can view their own tax rules" ON public.tax_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax rules" ON public.tax_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax rules" ON public.tax_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax rules" ON public.tax_rules FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tax_compliance_checks
CREATE POLICY "Users can view their own tax compliance checks" ON public.tax_compliance_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tax compliance checks" ON public.tax_compliance_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tax compliance checks" ON public.tax_compliance_checks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tax compliance checks" ON public.tax_compliance_checks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles they granted or have" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR auth.uid() = granted_by);
CREATE POLICY "Users can create roles they grant" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = granted_by);
CREATE POLICY "Users can update roles they granted" ON public.user_roles FOR UPDATE USING (auth.uid() = granted_by);
CREATE POLICY "Users can delete roles they granted" ON public.user_roles FOR DELETE USING (auth.uid() = granted_by);

-- RLS Policies for collaboration_invites
CREATE POLICY "Users can view invites they sent or received" ON public.collaboration_invites FOR SELECT USING (auth.uid() = inviter_id);
CREATE POLICY "Users can create their own invites" ON public.collaboration_invites FOR INSERT WITH CHECK (auth.uid() = inviter_id);
CREATE POLICY "Users can update their own invites" ON public.collaboration_invites FOR UPDATE USING (auth.uid() = inviter_id);
CREATE POLICY "Users can delete their own invites" ON public.collaboration_invites FOR DELETE USING (auth.uid() = inviter_id);

-- RLS Policies for activity_feeds
CREATE POLICY "Users can view their own activity feeds" ON public.activity_feeds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own activity feeds" ON public.activity_feeds FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for integration_connections
CREATE POLICY "Users can view their own integration connections" ON public.integration_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own integration connections" ON public.integration_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own integration connections" ON public.integration_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own integration connections" ON public.integration_connections FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sync_logs
CREATE POLICY "Users can view their own sync logs" ON public.sync_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sync logs" ON public.sync_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sync logs" ON public.sync_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sync logs" ON public.sync_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view their own performance metrics" ON public.performance_metrics FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "System can insert performance metrics" ON public.performance_metrics FOR INSERT WITH CHECK (true);

-- RLS Policies for query_cache
CREATE POLICY "Users can view their own query cache" ON public.query_cache FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "System can manage query cache" ON public.query_cache FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_ai_analysis_user_id ON public.document_ai_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_document_ai_analysis_document_id ON public.document_ai_analysis(document_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_user_id ON public.custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_user_id ON public.report_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_report_executions_report_id ON public.report_executions(report_id);
CREATE INDEX IF NOT EXISTS idx_entity_relationships_user_id ON public.entity_relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_inter_entity_transactions_user_id ON public.inter_entity_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_rules_user_id ON public.tax_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_compliance_checks_user_id ON public.tax_compliance_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_inviter_id ON public.collaboration_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_activity_feeds_user_id ON public.activity_feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_id ON public.integration_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_query_cache_key ON public.query_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_query_cache_expires ON public.query_cache(expires_at);

-- Add updated_at triggers for tables that need them
CREATE TRIGGER update_document_ai_analysis_updated_at BEFORE UPDATE ON public.document_ai_analysis FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON public.custom_reports FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_entity_relationships_updated_at BEFORE UPDATE ON public.entity_relationships FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_inter_entity_transactions_updated_at BEFORE UPDATE ON public.inter_entity_transactions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_tax_rules_updated_at BEFORE UPDATE ON public.tax_rules FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_integration_connections_updated_at BEFORE UPDATE ON public.integration_connections FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
