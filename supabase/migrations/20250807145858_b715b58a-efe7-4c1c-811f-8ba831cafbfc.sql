-- Update default credits to 50 and daily free credits to 10
ALTER TABLE public.user_credits 
ALTER COLUMN total_credits SET DEFAULT 50,
ALTER COLUMN daily_free_credits SET DEFAULT 10;

-- Update existing users to have more practical credit amounts
UPDATE public.user_credits 
SET total_credits = CASE 
  WHEN total_credits < 50 THEN 50 
  ELSE total_credits 
END,
daily_free_credits = 10,
updated_at = now();

-- Update the functions to use new defaults
CREATE OR REPLACE FUNCTION public.use_credits(user_id uuid, credits_to_use integer DEFAULT 1)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_credits INTEGER;
    available_credits INTEGER;
BEGIN
    -- Get current credits
    SELECT total_credits, used_credits INTO current_credits, available_credits
    FROM public.user_credits 
    WHERE user_credits.user_id = use_credits.user_id;
    
    -- Check if user has credits record, if not create one with 50 credits
    IF current_credits IS NULL THEN
        INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
        VALUES (use_credits.user_id, 50, 0, 10);
        current_credits := 50;
        available_credits := 0;
    END IF;
    
    -- Check if user has enough credits
    IF (current_credits - available_credits) < credits_to_use THEN
        RETURN FALSE;
    END IF;
    
    -- Use credits
    UPDATE public.user_credits 
    SET used_credits = used_credits + credits_to_use,
        updated_at = now()
    WHERE user_credits.user_id = use_credits.user_id;
    
    RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reset_daily_credits(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;