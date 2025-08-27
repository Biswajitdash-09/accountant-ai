-- Fix Security Definer View - Replace with regular view
DROP VIEW IF EXISTS public.user_sessions_secure;

-- Create regular view (not SECURITY DEFINER) for session data
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

-- Grant select permissions on the secure view
GRANT SELECT ON public.user_sessions_secure TO authenticated;

-- Fix remaining functions missing search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_default_currency()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
    IF NEW.currency_id IS NULL THEN
        NEW.currency_id := (
            SELECT default_currency_id 
            FROM public.user_preferences 
            WHERE user_id = NEW.user_id
        );
        
        -- Fallback to base currency if no user preference
        IF NEW.currency_id IS NULL THEN
            NEW.currency_id := (SELECT id FROM public.currencies WHERE is_base = true LIMIT 1);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;