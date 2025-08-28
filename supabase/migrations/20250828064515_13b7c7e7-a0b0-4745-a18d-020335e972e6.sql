-- Fix security definer view issue
-- Drop the problematic view and recreate without security definer
DROP VIEW IF EXISTS public.user_sessions_secure;

-- Create view without security definer (normal view)
CREATE VIEW public.user_sessions_secure AS
SELECT 
    id,
    user_id,
    ip_address,
    user_agent,
    last_active,
    expires_at,
    created_at
FROM public.user_sessions
WHERE user_id = auth.uid(); -- Built-in security filter at view level