-- Remove the secure view entirely to eliminate security definer warning
-- We'll handle security filtering in the application hooks instead
DROP VIEW IF EXISTS public.user_sessions_secure;