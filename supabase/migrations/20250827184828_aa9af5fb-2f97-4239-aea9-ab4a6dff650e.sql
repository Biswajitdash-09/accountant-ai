-- Remove the problematic secure view since we're handling security in hooks
DROP VIEW IF EXISTS public.user_sessions_secure;