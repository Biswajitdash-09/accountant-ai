-- Top up all existing users to 50 total credits
-- This ensures both new and existing users have at least 50 credits to use AI features

UPDATE public.user_credits
SET 
  total_credits = GREATEST(total_credits, 50),
  updated_at = now()
WHERE total_credits < 50;

-- Also reset used_credits for users who have exhausted their credits
-- so they can use the new topped-up credits
UPDATE public.user_credits
SET 
  used_credits = 0,
  updated_at = now()
WHERE used_credits >= total_credits;

-- Ensure the default for new users is 50 credits
ALTER TABLE public.user_credits 
ALTER COLUMN total_credits SET DEFAULT 50;