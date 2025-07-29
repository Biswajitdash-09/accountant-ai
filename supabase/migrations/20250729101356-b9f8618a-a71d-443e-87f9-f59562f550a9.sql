
-- Add Nigerian Naira to currencies table
INSERT INTO public.currencies (code, name, symbol, exchange_rate, is_base) 
VALUES ('NGN', 'Nigerian Naira', '₦', 1600.0, false)
ON CONFLICT (code) DO NOTHING;

-- Update Indian Rupee exchange rate if needed
UPDATE public.currencies 
SET exchange_rate = 83.0 
WHERE code = 'INR';

-- Create enhanced credit plans table
CREATE TABLE public.credit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'paid', -- 'free', 'paid'
  credits INTEGER NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_ngn NUMERIC(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on credit_plans
ALTER TABLE public.credit_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for credit plans (public read access)
CREATE POLICY "Anyone can view active credit plans" 
ON public.credit_plans 
FOR SELECT 
USING (is_active = true);

-- Insert default credit plans
INSERT INTO public.credit_plans (
  plan_id, plan_name, plan_type, credits, 
  price_usd, price_inr, price_ngn, 
  features, is_popular, sort_order
) VALUES 
-- Free Plan
('free', 'Free Plan', 'free', 5, 0, 0, 0, 
 '["5 credits per day", "Basic AI features", "Standard support", "Mobile responsive"]'::jsonb, 
 false, 1),

-- Starter Plan  
('starter', 'Starter Plan', 'paid', 20, 2.99, 249, 1200,
 '["20 credits instantly", "Advanced AI features", "Priority support", "No daily limits", "Mobile responsive"]'::jsonb,
 true, 2),

-- Pro Plan
('pro', 'Pro Plan', 'paid', 50, 5.99, 499, 2400,
 '["50 credits instantly", "Premium AI features", "Premium support", "No daily limits", "Advanced analytics", "Mobile responsive"]'::jsonb,
 false, 3),

-- Enterprise Plan
('enterprise', 'Enterprise Plan', 'paid', 100, 9.99, 829, 4000,
 '["100 credits instantly", "All premium features", "24/7 priority support", "Custom integrations", "Advanced analytics", "Team collaboration", "API access"]'::jsonb,
 false, 4);

-- Create enhanced user_credits table (drop existing and recreate with proper structure)
DROP TABLE IF EXISTS public.user_credits CASCADE;

CREATE TABLE public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 5,
  used_credits INTEGER NOT NULL DEFAULT 0,
  daily_free_credits INTEGER NOT NULL DEFAULT 5,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  current_plan_id TEXT DEFAULT 'free',
  currency_id UUID REFERENCES public.currencies(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'active',
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update credits" 
ON public.user_credits 
FOR UPDATE 
USING (true);

-- Create user_locations table for better location tracking
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  detected_from_ip BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_locations
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_locations
CREATE POLICY "Users can view their own location" 
ON public.user_locations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own location" 
ON public.user_locations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert locations" 
ON public.user_locations 
FOR INSERT 
WITH CHECK (true);

-- Update existing database functions for new credit system
CREATE OR REPLACE FUNCTION public.use_credits(user_id uuid, credits_to_use integer DEFAULT 1)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    current_total INTEGER;
    current_used INTEGER;
    available_credits INTEGER;
BEGIN
    -- Get current credits
    SELECT total_credits, used_credits INTO current_total, current_used
    FROM public.user_credits 
    WHERE user_credits.user_id = use_credits.user_id;
    
    -- Check if user has credits record, if not create one
    IF current_total IS NULL THEN
        INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
        VALUES (use_credits.user_id, 5, 0, 5);
        current_total := 5;
        current_used := 0;
    END IF;
    
    -- Calculate available credits
    available_credits := current_total - current_used;
    
    -- Check if user has enough credits
    IF available_credits < credits_to_use THEN
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

CREATE OR REPLACE FUNCTION public.add_credits(user_id uuid, credits_to_add integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Insert or update user credits
    INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
    VALUES (add_credits.user_id, credits_to_add, 0, 5)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_credits = user_credits.total_credits + credits_to_add,
        updated_at = now();
    
    RETURN TRUE;
END;
$function$;

-- Create trigger for updated_at
CREATE OR REPLACE TRIGGER update_credit_plans_updated_at
    BEFORE UPDATE ON public.credit_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_locations_updated_at
    BEFORE UPDATE ON public.user_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
