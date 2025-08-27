-- Drop the old insecure log_security_event function (the one with p_user_id parameter)
DROP FUNCTION IF EXISTS public.log_security_event(uuid, text, text, inet, text, jsonb);

-- Check for any materialized views or other objects that might be flagged
-- Let's also ensure we don't have any security definer functions that might be detected as views
SELECT viewname, definition FROM pg_views WHERE viewname = 'user_sessions_secure';