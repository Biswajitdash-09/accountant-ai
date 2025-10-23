-- Create TrueLayer connections table
CREATE TABLE IF NOT EXISTS public.truelayer_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  provider_id text NOT NULL,
  account_id text,
  account_name text,
  institution_name text,
  status text DEFAULT 'active',
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Mono connections table
CREATE TABLE IF NOT EXISTS public.mono_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id text NOT NULL,
  mono_code text NOT NULL,
  institution_name text,
  institution_type text,
  account_name text,
  status text DEFAULT 'active',
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scheduled reports table
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  report_name text NOT NULL,
  data_types text[] NOT NULL,
  frequency text NOT NULL,
  email text NOT NULL,
  format text DEFAULT 'pdf',
  last_sent_at timestamptz,
  next_send_at timestamptz,
  is_active boolean DEFAULT true,
  filters jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Yodlee connections table (missing from original)
CREATE TABLE IF NOT EXISTS public.yodlee_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  yodlee_user_id text NOT NULL,
  access_token text NOT NULL,
  provider_account_id text,
  account_name text,
  institution_name text,
  status text DEFAULT 'active',
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.truelayer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mono_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yodlee_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for TrueLayer
CREATE POLICY "Users can view their own TrueLayer connections"
  ON public.truelayer_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own TrueLayer connections"
  ON public.truelayer_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own TrueLayer connections"
  ON public.truelayer_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own TrueLayer connections"
  ON public.truelayer_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Mono
CREATE POLICY "Users can view their own Mono connections"
  ON public.mono_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Mono connections"
  ON public.mono_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Mono connections"
  ON public.mono_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Mono connections"
  ON public.mono_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Scheduled Reports
CREATE POLICY "Users can view their own scheduled reports"
  ON public.scheduled_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled reports"
  ON public.scheduled_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled reports"
  ON public.scheduled_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled reports"
  ON public.scheduled_reports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Yodlee
CREATE POLICY "Users can view their own Yodlee connections"
  ON public.yodlee_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Yodlee connections"
  ON public.yodlee_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Yodlee connections"
  ON public.yodlee_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Yodlee connections"
  ON public.yodlee_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_truelayer_connections_updated_at
  BEFORE UPDATE ON public.truelayer_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mono_connections_updated_at
  BEFORE UPDATE ON public.mono_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yodlee_connections_updated_at
  BEFORE UPDATE ON public.yodlee_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();