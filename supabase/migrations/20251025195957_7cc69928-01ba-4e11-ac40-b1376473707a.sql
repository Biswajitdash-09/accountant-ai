-- Create plaid_connections table for US banking integration
CREATE TABLE IF NOT EXISTS public.plaid_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  item_id TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  accounts JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'error', 'disconnected')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Create setu_connections table for India banking integration
CREATE TABLE IF NOT EXISTS public.setu_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  fip_id TEXT,
  fip_name TEXT,
  account_type TEXT,
  account_details JSONB DEFAULT '{}'::jsonb,
  consent_id TEXT,
  consent_status TEXT DEFAULT 'active' CHECK (consent_status IN ('active', 'expired', 'revoked')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Enable RLS
ALTER TABLE public.plaid_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.setu_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plaid_connections
CREATE POLICY "Users can view their own Plaid connections"
  ON public.plaid_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Plaid connections"
  ON public.plaid_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Plaid connections"
  ON public.plaid_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Plaid connections"
  ON public.plaid_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for setu_connections
CREATE POLICY "Users can view their own Setu connections"
  ON public.setu_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Setu connections"
  ON public.setu_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Setu connections"
  ON public.setu_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Setu connections"
  ON public.setu_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plaid_connections_user_id ON public.plaid_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_plaid_connections_item_id ON public.plaid_connections(item_id);
CREATE INDEX IF NOT EXISTS idx_setu_connections_user_id ON public.setu_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_setu_connections_account_id ON public.setu_connections(account_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for both tables
CREATE TRIGGER update_plaid_connections_updated_at
  BEFORE UPDATE ON public.plaid_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setu_connections_updated_at
  BEFORE UPDATE ON public.setu_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.plaid_connections IS 'Stores US banking connections via Plaid API';
COMMENT ON TABLE public.setu_connections IS 'Stores India banking connections via Setu Account Aggregator API';