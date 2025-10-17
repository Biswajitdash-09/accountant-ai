-- Phase 1: Open Banking Tax Integration - Database Schema

-- Bank connections table
CREATE TABLE IF NOT EXISTS bank_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'truelayer', 'yodlee', 'mono', 'okra', 'setu', 'finvu'
  provider_account_id text,
  encrypted_access_token text,
  encrypted_refresh_token text,
  consent_id text,
  account_name text,
  account_type text, -- 'checking', 'savings', 'credit'
  currency text DEFAULT 'GBP',
  balance numeric DEFAULT 0,
  status text DEFAULT 'active', -- 'active', 'expired', 'revoked', 'error'
  last_sync_at timestamptz,
  consent_expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enhanced transactions table (add new columns)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS provider_transaction_id text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bank_connection_id uuid REFERENCES bank_connections(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS merchant_name text;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS raw_data jsonb;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sync_status text DEFAULT 'synced';

-- AI transaction classification table
CREATE TABLE IF NOT EXISTS transaction_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_category text, -- 'groceries', 'rent', 'utilities', 'salary', etc.
  ai_type text, -- 'income', 'expense', 'transfer', 'refund'
  is_tax_deductible boolean DEFAULT false,
  tax_category text, -- 'business_expense', 'charitable', 'medical', etc.
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_comment text,
  manual_override boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transaction sync logs
CREATE TABLE IF NOT EXISTS transaction_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_connection_id uuid REFERENCES bank_connections(id) ON DELETE CASCADE,
  sync_type text NOT NULL, -- 'full', 'incremental'
  transactions_imported integer DEFAULT 0,
  transactions_classified integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Tax filing submissions
CREATE TABLE IF NOT EXISTS tax_filing_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_period_id uuid REFERENCES tax_periods(id) ON DELETE SET NULL,
  country text NOT NULL,
  filing_method text NOT NULL, -- 'hmrc_oauth', 'irs_efile', 'manual_download'
  filing_status text DEFAULT 'draft', -- 'draft', 'submitted', 'accepted', 'rejected'
  submission_data jsonb DEFAULT '{}'::jsonb,
  confirmation_number text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_filing_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_connections
CREATE POLICY "Users can view their own bank connections"
  ON bank_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank connections"
  ON bank_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank connections"
  ON bank_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank connections"
  ON bank_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for transaction_classifications
CREATE POLICY "Users can view their own transaction classifications"
  ON transaction_classifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transaction classifications"
  ON transaction_classifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transaction classifications"
  ON transaction_classifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transaction classifications"
  ON transaction_classifications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for transaction_sync_logs
CREATE POLICY "Users can view their own sync logs"
  ON transaction_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
  ON transaction_sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tax_filing_submissions
CREATE POLICY "Users can view their own tax filings"
  ON tax_filing_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tax filings"
  ON tax_filing_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax filings"
  ON tax_filing_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id ON bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_connections_provider ON bank_connections(provider);
CREATE INDEX IF NOT EXISTS idx_bank_connections_status ON bank_connections(status);

CREATE INDEX IF NOT EXISTS idx_transactions_bank_connection ON transactions(bank_connection_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_id ON transactions(provider_transaction_id);

CREATE INDEX IF NOT EXISTS idx_classifications_transaction ON transaction_classifications(transaction_id);
CREATE INDEX IF NOT EXISTS idx_classifications_user ON transaction_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_classifications_tax_deductible ON transaction_classifications(is_tax_deductible);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user ON transaction_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_bank_connection ON transaction_sync_logs(bank_connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON transaction_sync_logs(status);

CREATE INDEX IF NOT EXISTS idx_tax_filings_user ON tax_filing_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_filings_status ON tax_filing_submissions(filing_status);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_bank_connections_updated_at ON bank_connections;
CREATE TRIGGER update_bank_connections_updated_at
  BEFORE UPDATE ON bank_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transaction_classifications_updated_at ON transaction_classifications;
CREATE TRIGGER update_transaction_classifications_updated_at
  BEFORE UPDATE ON transaction_classifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_filing_submissions_updated_at ON tax_filing_submissions;
CREATE TRIGGER update_tax_filing_submissions_updated_at
  BEFORE UPDATE ON tax_filing_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();