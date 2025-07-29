
-- Add Nigerian Naira and South African Rand to currencies table
INSERT INTO public.currencies (code, name, symbol, exchange_rate, is_base) VALUES 
('NGN', 'Nigerian Naira', '₦', 1650.00, false),
('ZAR', 'South African Rand', 'R', 18.50, false)
ON CONFLICT (code) DO NOTHING;

-- Add exchange rate data for NGN and ZAR
INSERT INTO public.exchange_rates (base, quote, rate, fetched_at) VALUES
('USD', 'NGN', 1650.00, NOW()),
('USD', 'ZAR', 18.50, NOW()),
('EUR', 'NGN', 1800.00, NOW()),
('EUR', 'ZAR', 20.20, NOW()),
('GBP', 'NGN', 2100.00, NOW()),
('GBP', 'ZAR', 23.50, NOW()),
('NGN', 'USD', 0.000606, NOW()),
('ZAR', 'USD', 0.054054, NOW()),
('NGN', 'ZAR', 0.0112, NOW()),
('ZAR', 'NGN', 89.19, NOW())
ON CONFLICT (base, quote, fetched_at) DO NOTHING;

-- Create function to initialize user credits for existing users
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert initial credits for users who don't have credits record
    INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits, subscription_tier)
    SELECT 
        u.id,
        5, -- 5 initial credits
        0, -- 0 used credits
        5, -- 5 daily free credits
        'free' -- free tier
    FROM auth.users u
    LEFT JOIN public.user_credits uc ON u.id = uc.user_id
    WHERE uc.user_id IS NULL;
END;
$$;

-- Execute the function to initialize credits for existing users
SELECT initialize_user_credits();

-- Update the handle_new_user function to also create user_credits record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  -- Insert initial user credits
  INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits, subscription_tier)
  VALUES (NEW.id, 5, 0, 5, 'free');
  
  RETURN NEW;
END;
$$;

-- Function to clean up old exchange rates (keep last 1000 entries)
CREATE OR REPLACE FUNCTION cleanup_old_exchange_rates(keep_count INTEGER DEFAULT 1000)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.exchange_rates
    WHERE id NOT IN (
        SELECT id FROM public.exchange_rates
        ORDER BY fetched_at DESC
        LIMIT keep_count
    );
END;
$$;
