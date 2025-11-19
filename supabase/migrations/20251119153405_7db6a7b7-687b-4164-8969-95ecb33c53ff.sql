-- =====================================================
-- COMPREHENSIVE SECURITY FIX MIGRATION
-- Fixes 19 security issues identified by security scan
-- =====================================================

-- =====================================================
-- PART 1: FIX RLS POLICIES FOR EXPOSED TABLES
-- =====================================================

-- Fix crypto_holdings exposure
ALTER TABLE public.crypto_holdings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own crypto holdings" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can manage their own crypto holdings" ON public.crypto_holdings;

CREATE POLICY "Users can view their own crypto holdings"
  ON public.crypto_holdings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crypto_wallets
      WHERE crypto_wallets.id = crypto_holdings.wallet_id
      AND crypto_wallets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own crypto holdings"
  ON public.crypto_holdings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.crypto_wallets
      WHERE crypto_wallets.id = crypto_holdings.wallet_id
      AND crypto_wallets.user_id = auth.uid()
    )
  );

-- Fix integration_connections exposure
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  provider text NOT NULL,
  credentials jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own connections" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can manage their own connections" ON public.integration_connections;

CREATE POLICY "Users can view their own connections"
  ON public.integration_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own connections"
  ON public.integration_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Fix payments table exposure
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can manage their own payments" ON public.payments;

CREATE POLICY "Users can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
  ON public.payments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Fix subscriptions table exposure
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- Fix invoices table exposure
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;

CREATE POLICY "Users can view their own invoices"
  ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Fix refunds table exposure
DROP POLICY IF EXISTS "Users can view their own refunds" ON public.refunds;

CREATE POLICY "Users can view their own refunds"
  ON public.refunds
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request refunds for their payments"
  ON public.refunds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Fix payment_attempts exposure
DROP POLICY IF EXISTS "Users can view their own payment attempts" ON public.payment_attempts;

CREATE POLICY "Users can view their own payment attempts"
  ON public.payment_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Fix crypto_nfts exposure
DROP POLICY IF EXISTS "Users can view their own NFTs" ON public.crypto_nfts;

CREATE POLICY "Users can view their own NFTs"
  ON public.crypto_nfts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crypto_wallets
      WHERE crypto_wallets.id = crypto_nfts.wallet_id
      AND crypto_wallets.user_id = auth.uid()
    )
  );

-- Fix crypto_transactions exposure
DROP POLICY IF EXISTS "Users can view their own crypto transactions" ON public.crypto_transactions;

CREATE POLICY "Users can view their own crypto transactions"
  ON public.crypto_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.crypto_wallets
      WHERE crypto_wallets.id = crypto_transactions.wallet_id
      AND crypto_wallets.user_id = auth.uid()
    )
  );

-- Fix bank_connections exposure (contains access tokens)
DROP POLICY IF EXISTS "Users can view their own bank connections" ON public.bank_connections;
DROP POLICY IF EXISTS "Users can manage their own bank connections" ON public.bank_connections;

CREATE POLICY "Users can view their own bank connections"
  ON public.bank_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bank connections"
  ON public.bank_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Fix hmrc_connections exposure
DROP POLICY IF EXISTS "Users can view their own HMRC connections" ON public.hmrc_connections;
DROP POLICY IF EXISTS "Users can manage their own HMRC connections" ON public.hmrc_connections;

CREATE POLICY "Users can view their own HMRC connections"
  ON public.hmrc_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own HMRC connections"
  ON public.hmrc_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- Fix user_security_settings exposure
DROP POLICY IF EXISTS "Users can view their own security settings" ON public.user_security_settings;
DROP POLICY IF EXISTS "Users can manage their own security settings" ON public.user_security_settings;

CREATE POLICY "Users can view their own security settings"
  ON public.user_security_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own security settings"
  ON public.user_security_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- Fix api_keys exposure
DROP POLICY IF EXISTS "Users can view their own API keys" ON public.api_keys;
DROP POLICY IF EXISTS "Users can manage their own API keys" ON public.api_keys;

CREATE POLICY "Users can view their own API keys"
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API keys"
  ON public.api_keys
  FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- PART 2: FIX FUNCTION SEARCH PATHS
-- =====================================================

-- Fix trigger_webhooks function
CREATE OR REPLACE FUNCTION public.trigger_webhooks(p_user_id uuid, p_event_type text, p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.webhook_deliveries (webhook_id, event_type, payload, status)
  SELECT 
    id,
    p_event_type,
    p_payload,
    'pending'
  FROM public.webhooks
  WHERE user_id = p_user_id
    AND is_active = true
    AND p_event_type = ANY(events);
END;
$$;

-- Fix refresh_financial_views function
CREATE OR REPLACE FUNCTION public.refresh_financial_views()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_total_assets;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_cash_flow;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_category_spending;
END;
$$;

-- Fix update_webhooks_updated_at function
CREATE OR REPLACE FUNCTION public.update_webhooks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function - already has search_path set correctly

-- =====================================================
-- PART 3: REVOKE PUBLIC ACCESS TO MATERIALIZED VIEWS
-- =====================================================

-- Remove public access to materialized views
REVOKE ALL ON public.mv_user_total_assets FROM anon, authenticated;
REVOKE ALL ON public.mv_user_cash_flow FROM anon, authenticated;
REVOKE ALL ON public.mv_user_category_spending FROM anon, authenticated;

-- Grant specific access only to authenticated users for their own data
-- Note: Materialized views cannot have RLS, so we revoke all public access
-- and recommend using regular views or queries instead for user-specific data

-- =====================================================
-- PART 4: ADD AUDIT LOGGING FOR SENSITIVE OPERATIONS
-- =====================================================

-- Create audit trigger for sensitive table changes
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive data
  INSERT INTO public.security_audit_logs (
    user_id,
    action_type,
    action_description,
    metadata
  ) VALUES (
    auth.uid(),
    TG_OP,
    'Access to ' || TG_TABLE_NAME,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply audit logging to sensitive tables
DROP TRIGGER IF EXISTS audit_crypto_holdings ON public.crypto_holdings;
CREATE TRIGGER audit_crypto_holdings
  AFTER INSERT OR UPDATE OR DELETE ON public.crypto_holdings
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

DROP TRIGGER IF EXISTS audit_payments ON public.payments;
CREATE TRIGGER audit_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

DROP TRIGGER IF EXISTS audit_bank_connections ON public.bank_connections;
CREATE TRIGGER audit_bank_connections
  AFTER INSERT OR UPDATE OR DELETE ON public.bank_connections
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

-- =====================================================
-- PART 5: ADD MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Add indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_crypto_holdings_wallet_id ON public.crypto_holdings(wallet_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON public.crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_user_id ON public.payment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id ON public.bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_hmrc_connections_user_id ON public.hmrc_connections(user_id);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify RLS is enabled on all sensitive tables
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN (
      'crypto_holdings', 'integration_connections', 'payments', 
      'subscriptions', 'invoices', 'refunds', 'payment_attempts',
      'crypto_nfts', 'crypto_transactions', 'bank_connections',
      'hmrc_connections', 'user_security_settings', 'api_keys'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;