-- Security fixes: RLS policy corrections and secure session handling (correct approach)

-- 1. Fix payments table RLS policies
-- Drop overly permissive policies (payments should only be managed by service role)
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

-- Create secure policy for payments (service role management)
CREATE POLICY "Service role can manage payments" ON public.payments 
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Fix security_audit_logs RLS policies  
-- Drop overly permissive system policy if it exists
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_logs;

-- Create secure policy for audit logs (service role can insert system events)
CREATE POLICY "Service role can insert audit logs" ON public.security_audit_logs 
FOR INSERT TO service_role WITH CHECK (true);

-- 3. Create secure session view to prevent token exposure
-- First drop if exists
DROP VIEW IF EXISTS public.user_sessions_secure;

-- Create the view without RLS (we'll handle security in the hook)
CREATE VIEW public.user_sessions_secure AS
SELECT 
    id,
    user_id,
    ip_address,
    user_agent,
    last_active,
    expires_at,
    created_at
FROM public.user_sessions;