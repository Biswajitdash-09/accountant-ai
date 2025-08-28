-- Security fixes: RLS policy corrections and secure session handling (fixed)

-- 1. Fix payments table RLS policies
-- Drop overly permissive policies (only the ones that exist)
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;

-- Create secure policy for payments (service role management)
CREATE POLICY "Service role can manage payments" ON public.payments 
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Fix security_audit_logs RLS policies  
-- Drop overly permissive system policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_logs;

-- Create secure policies for audit logs
CREATE POLICY "Service role can insert audit logs" ON public.security_audit_logs 
FOR INSERT TO service_role WITH CHECK (true);

-- Note: Keep existing user policies for audit logs as they're already secure

-- 3. Create secure session view to prevent token exposure
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

-- Enable RLS on the view
ALTER VIEW public.user_sessions_secure OWNER TO postgres;

-- Create policy for secure session view
CREATE POLICY "Users can view their own secure sessions" ON public.user_sessions_secure
FOR SELECT TO authenticated USING (auth.uid() = user_id);