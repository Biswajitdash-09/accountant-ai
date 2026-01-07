-- Update or create the trigger function to give new users 50 credits
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits, subscription_tier, current_plan_id)
  VALUES (NEW.id, 50, 0, 10, 'free', 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- Update existing users who have 0 credits to give them 50 credits (only if they haven't used any)
UPDATE public.user_credits 
SET total_credits = 50 
WHERE total_credits = 0 AND used_credits = 0;