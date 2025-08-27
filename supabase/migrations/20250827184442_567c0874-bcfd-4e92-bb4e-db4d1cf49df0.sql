-- Drop the old insecure credit functions
DROP FUNCTION IF EXISTS public.add_credits(uuid, integer);
DROP FUNCTION IF EXISTS public.use_credits(uuid, integer);

-- Check for and remove any security definer views
-- Note: PostgreSQL doesn't support SECURITY DEFINER views, so this might be a false positive
-- Let's ensure our view is properly created without any security definer remnants

DROP VIEW IF EXISTS public.user_sessions_secure CASCADE;

-- Recreate the view cleanly
CREATE VIEW public.user_sessions_secure AS
SELECT 
  id,
  user_id,
  ip_address,
  created_at,
  last_active,
  expires_at,
  user_agent
FROM public.user_sessions;

-- Set proper RLS on the base table to control access
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for user_sessions to use the secure view pattern
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
FOR DELETE 
USING (auth.uid() = user_id);

-- Grant appropriate permissions
GRANT SELECT ON public.user_sessions_secure TO authenticated;