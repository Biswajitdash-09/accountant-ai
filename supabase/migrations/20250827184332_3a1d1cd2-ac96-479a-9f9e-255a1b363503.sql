-- Security Fix 1: Lock down Subscribers RLS policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Keep only SELECT policy for subscribers
CREATE POLICY "select_own_subscription_secure" ON public.subscribers
FOR SELECT 
USING ((user_id = auth.uid()) OR (email = auth.email()));

-- Security Fix 2: Lock down Query Cache RLS policies  
DROP POLICY IF EXISTS "System can manage query cache" ON public.query_cache;

-- Create secure cache management function
CREATE OR REPLACE FUNCTION public.cache_upsert(
  p_cache_key text,
  p_cache_data jsonb,
  p_expires_at timestamp with time zone,
  p_user_scoped boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  cache_id uuid;
BEGIN
  IF p_user_scoped THEN
    -- User-scoped cache - require authentication
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Authentication required for user-scoped cache';
    END IF;
    
    INSERT INTO public.query_cache (cache_key, cache_data, expires_at, user_id)
    VALUES (p_cache_key, p_cache_data, p_expires_at, auth.uid())
    ON CONFLICT (cache_key, user_id) 
    DO UPDATE SET 
      cache_data = EXCLUDED.cache_data,
      expires_at = EXCLUDED.expires_at,
      access_count = query_cache.access_count + 1,
      last_accessed = now()
    RETURNING id INTO cache_id;
  ELSE
    -- System cache - only service role can create
    INSERT INTO public.query_cache (cache_key, cache_data, expires_at, user_id)
    VALUES (p_cache_key, p_cache_data, p_expires_at, NULL)
    ON CONFLICT (cache_key) WHERE user_id IS NULL
    DO UPDATE SET 
      cache_data = EXCLUDED.cache_data,
      expires_at = EXCLUDED.expires_at,
      access_count = query_cache.access_count + 1,
      last_accessed = now()
    RETURNING id INTO cache_id;
  END IF;
  
  RETURN cache_id;
END;
$$;

-- Revoke execute from public roles for system cache operations
REVOKE EXECUTE ON FUNCTION public.cache_upsert FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cache_upsert TO service_role;

-- Security Fix 3: Secure SECURITY DEFINER RPCs
-- Create admin-only credit management
CREATE OR REPLACE FUNCTION public.admin_add_credits(
  p_user_id uuid, 
  p_credits_to_add integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Insert or update user credits
    INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
    VALUES (p_user_id, p_credits_to_add, 0, 5)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_credits = user_credits.total_credits + p_credits_to_add,
        updated_at = now();
    
    RETURN TRUE;
END;
$$;

-- Revoke from public, grant only to service_role
REVOKE EXECUTE ON FUNCTION public.admin_add_credits FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_add_credits TO service_role;

-- Secure user credit usage function
CREATE OR REPLACE FUNCTION public.user_use_credits(p_credits_to_use integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    current_credits INTEGER;
    available_credits INTEGER;
    user_uuid uuid;
BEGIN
    -- Get authenticated user ID
    user_uuid := auth.uid();
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Authentication required';
    END IF;
    
    -- Get current credits
    SELECT total_credits, used_credits INTO current_credits, available_credits
    FROM public.user_credits 
    WHERE user_id = user_uuid;
    
    -- Check if user has credits record, if not create one with 50 credits
    IF current_credits IS NULL THEN
        INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
        VALUES (user_uuid, 50, 0, 10);
        current_credits := 50;
        available_credits := 0;
    END IF;
    
    -- Check if user has enough credits
    IF (current_credits - available_credits) < p_credits_to_use THEN
        RETURN FALSE;
    END IF;
    
    -- Use credits
    UPDATE public.user_credits 
    SET used_credits = used_credits + p_credits_to_use,
        updated_at = now()
    WHERE user_id = user_uuid;
    
    RETURN TRUE;
END;
$$;

-- Secure crypto assets function with ownership validation
CREATE OR REPLACE FUNCTION public.get_user_crypto_assets(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(id uuid, user_id uuid, symbol text, quantity numeric, avg_buy_price numeric, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Use authenticated user if no user_id provided, or validate ownership
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  -- Ensure user can only access their own data
  IF target_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: can only view own crypto assets';
  END IF;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    ca.id,
    ca.user_id,
    ca.symbol,
    ca.quantity,
    ca.avg_buy_price,
    ca.created_at
  FROM crypto_assets ca
  WHERE ca.user_id = target_user_id;
END;
$$;

-- Secure security event logging
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_action_type text, 
  p_action_description text, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  user_uuid uuid;
BEGIN
    -- Use authenticated user ID, ignore any passed user_id
    user_uuid := auth.uid();
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Authentication required for security logging';
    END IF;
    
    INSERT INTO public.security_audit_logs (
        user_id, 
        action_type, 
        action_description, 
        ip_address, 
        user_agent, 
        metadata
    )
    VALUES (
        user_uuid, 
        p_action_type, 
        p_action_description, 
        p_ip_address, 
        p_user_agent, 
        p_metadata
    );
END;
$$;

-- Update existing functions to use proper search_path
CREATE OR REPLACE FUNCTION public.reset_daily_credits(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    -- Reset daily credits if it's a new day
    UPDATE public.user_credits 
    SET used_credits = 0,
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_credits.user_id = reset_daily_credits.user_id 
    AND last_reset_date < CURRENT_DATE;
    
    -- If no record exists, create one with 50 credits
    IF NOT FOUND THEN
        INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
        VALUES (reset_daily_credits.user_id, 50, 0, 10)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Security Fix 4: Create secure session view
CREATE OR REPLACE VIEW public.user_sessions_secure AS
SELECT 
  id,
  user_id,
  ip_address,
  created_at,
  last_active,
  expires_at,
  user_agent,
  '***HIDDEN***' as session_token
FROM public.user_sessions;

-- Grant select permissions on the secure view
GRANT SELECT ON public.user_sessions_secure TO authenticated;

-- Security Fix 5: Lock down profiles role changes
CREATE POLICY "Users cannot update their own role" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Security Fix 6: Enhanced RLS on security_audit_logs
CREATE POLICY "Users can insert their own security logs" ON public.security_audit_logs
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert security logs" ON public.security_audit_logs
FOR INSERT 
TO service_role
WITH CHECK (true);