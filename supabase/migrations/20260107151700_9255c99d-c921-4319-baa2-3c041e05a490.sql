-- Create trigger to auto-create user_security_settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_security_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_security_settings (
    user_id, 
    two_factor_enabled, 
    two_factor_verified,
    two_factor_secret,
    backup_codes
  )
  VALUES (
    NEW.id, 
    false, 
    false,
    null,
    null
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_security ON auth.users;
CREATE TRIGGER on_auth_user_created_security
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_security_settings();

-- Insert security settings for existing users who don't have them
INSERT INTO public.user_security_settings (user_id, two_factor_enabled, two_factor_verified)
SELECT id, false, false
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_security_settings)
ON CONFLICT (user_id) DO NOTHING;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON public.user_security_settings(user_id);