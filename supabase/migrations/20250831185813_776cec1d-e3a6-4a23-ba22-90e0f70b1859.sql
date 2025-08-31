
-- 1) Barcode scans
CREATE TABLE IF NOT EXISTS public.barcode_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scan_type text NOT NULL CHECK (scan_type IN ('receipt','spreadsheet','upi','other')),
  raw_content text NOT NULL,
  parsed_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'parsed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.barcode_scans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_scans' AND policyname = 'Users can view their own barcode scans'
  ) THEN
    CREATE POLICY "Users can view their own barcode scans"
      ON public.barcode_scans
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_scans' AND policyname = 'Users can insert their own barcode scans'
  ) THEN
    CREATE POLICY "Users can insert their own barcode scans"
      ON public.barcode_scans
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_scans' AND policyname = 'Users can update their own barcode scans'
  ) THEN
    CREATE POLICY "Users can update their own barcode scans"
      ON public.barcode_scans
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_scans' AND policyname = 'Users can delete their own barcode scans'
  ) THEN
    CREATE POLICY "Users can delete their own barcode scans"
      ON public.barcode_scans
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_barcode_scans_user_created
  ON public.barcode_scans (user_id, created_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_barcode_scans ON public.barcode_scans;
CREATE TRIGGER set_updated_at_barcode_scans
  BEFORE UPDATE ON public.barcode_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Barcode spreadsheets (live datasets)
CREATE TABLE IF NOT EXISTS public.barcode_spreadsheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  headers jsonb NOT NULL DEFAULT '[]'::jsonb,
  rows jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_scan_id uuid REFERENCES public.barcode_scans(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.barcode_spreadsheets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_spreadsheets' AND policyname = 'Users can view their own barcode spreadsheets'
  ) THEN
    CREATE POLICY "Users can view their own barcode spreadsheets"
      ON public.barcode_spreadsheets
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_spreadsheets' AND policyname = 'Users can insert their own barcode spreadsheets'
  ) THEN
    CREATE POLICY "Users can insert their own barcode spreadsheets"
      ON public.barcode_spreadsheets
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_spreadsheets' AND policyname = 'Users can update their own barcode spreadsheets'
  ) THEN
    CREATE POLICY "Users can update their own barcode spreadsheets"
      ON public.barcode_spreadsheets
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'barcode_spreadsheets' AND policyname = 'Users can delete their own barcode spreadsheets'
  ) THEN
    CREATE POLICY "Users can delete their own barcode spreadsheets"
      ON public.barcode_spreadsheets
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_barcode_spreadsheets_user_created
  ON public.barcode_spreadsheets (user_id, created_at DESC);

DROP TRIGGER IF EXISTS set_updated_at_barcode_spreadsheets ON public.barcode_spreadsheets;
CREATE TRIGGER set_updated_at_barcode_spreadsheets
  BEFORE UPDATE ON public.barcode_spreadsheets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Extend/create payments to support Cashfree UPI
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    CREATE TABLE public.payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      amount numeric NOT NULL,
      currency text NOT NULL DEFAULT 'USD',
      credits integer NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'pending',
      plan_id text,
      plan_name text,
      payment_method text NOT NULL DEFAULT 'card', -- e.g., card, upi
      provider text NOT NULL DEFAULT 'stripe',     -- e.g., stripe, cashfree
      provider_order_id text,
      provider_payment_id text,
      provider_session_id text,
      payment_link text,
      upi_vpa text,
      metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can view own payments"
      ON public.payments FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own payments"
      ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own payments"
      ON public.payments FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own payments"
      ON public.payments FOR DELETE USING (auth.uid() = user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user_created
      ON public.payments (user_id, created_at DESC);
    DROP TRIGGER IF EXISTS set_updated_at_payments ON public.payments;
    CREATE TRIGGER set_updated_at_payments
      BEFORE UPDATE ON public.payments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  ELSE
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'stripe';
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_order_id text;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_payment_id text;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_session_id text;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_link text;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS upi_vpa text;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 4) Payment webhook logs (kept private; RLS enabled, no user policies)
CREATE TABLE IF NOT EXISTS public.payment_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  raw_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  signature text,
  status text NOT NULL DEFAULT 'received',
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

-- (Intentionally no RLS policies for end users; only service role inserts/reads if needed)
