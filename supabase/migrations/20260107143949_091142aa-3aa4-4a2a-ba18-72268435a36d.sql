-- Full refresh: Give ALL users 50 fresh credits
UPDATE public.user_credits
SET 
  total_credits = 50,
  used_credits = 0,
  updated_at = now();

-- Ensure default for new users is 50 credits with 0 used
ALTER TABLE public.user_credits 
ALTER COLUMN total_credits SET DEFAULT 50;

ALTER TABLE public.user_credits 
ALTER COLUMN used_credits SET DEFAULT 0;