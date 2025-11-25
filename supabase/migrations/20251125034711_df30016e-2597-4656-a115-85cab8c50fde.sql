-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  referral_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  notified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'converted')),
  metadata JSONB DEFAULT '{}'::jsonb,
  position INTEGER
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_position ON public.waitlist(position);

-- Enable RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can join waitlist (public signup)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can check their position
CREATE POLICY "Anyone can check their waitlist position"
  ON public.waitlist FOR SELECT
  USING (true);

-- Policy: Only admins can update waitlist
CREATE POLICY "Admins can update waitlist"
  ON public.waitlist FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role_type = 'admin'
      AND is_active = true
    )
  );

-- Policy: Only admins can delete from waitlist
CREATE POLICY "Admins can delete from waitlist"
  ON public.waitlist FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role_type = 'admin'
      AND is_active = true
    )
  );

-- Function to calculate waitlist position
CREATE OR REPLACE FUNCTION public.update_waitlist_position()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate position based on creation time
  NEW.position := (
    SELECT COUNT(*) + 1
    FROM public.waitlist
    WHERE created_at < NEW.created_at
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-calculate position on insert
DROP TRIGGER IF EXISTS calculate_waitlist_position ON public.waitlist;
CREATE TRIGGER calculate_waitlist_position
  BEFORE INSERT ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_waitlist_position();