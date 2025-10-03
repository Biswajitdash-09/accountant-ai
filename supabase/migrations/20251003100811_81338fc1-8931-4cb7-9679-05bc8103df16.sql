-- Create security definer function to check user roles (prevents RLS recursion)
-- Works with existing user_roles table structure
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role_type = _role_type
      AND is_active = true
      AND entity_id IS NULL -- Global roles, not entity-specific
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Insert default 'user' role for existing users who don't have one
INSERT INTO public.user_roles (user_id, role_type, permissions, granted_by, is_active)
SELECT 
  id, 
  'user'::text, 
  '{}'::jsonb, 
  id, -- self-granted for migration
  true
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = auth.users.id 
  AND role_type = 'user'
  AND entity_id IS NULL
)
ON CONFLICT DO NOTHING;