
-- Create user_credits table
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total_credits INTEGER NOT NULL DEFAULT 0,
  used_credits INTEGER NOT NULL DEFAULT 0,
  daily_free_credits INTEGER NOT NULL DEFAULT 5,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits" 
  ON public.user_credits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" 
  ON public.user_credits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
  ON public.user_credits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create function to use credits
CREATE OR REPLACE FUNCTION public.use_credits(user_id UUID, credits_to_use INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INTEGER;
    available_credits INTEGER;
BEGIN
    -- Get current credits
    SELECT total_credits, used_credits INTO current_credits, available_credits
    FROM public.user_credits 
    WHERE user_credits.user_id = use_credits.user_id;
    
    -- Check if user has credits record, if not create one
    IF current_credits IS NULL THEN
        INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
        VALUES (use_credits.user_id, 5, 0, 5);
        current_credits := 5;
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
$$;

-- Create function to add credits
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, credits_to_add INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create function to reset daily credits
CREATE OR REPLACE FUNCTION public.reset_daily_credits(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Reset daily credits if it's a new day
    UPDATE public.user_credits 
    SET used_credits = 0,
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_credits.user_id = reset_daily_credits.user_id 
    AND last_reset_date < CURRENT_DATE;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.user_credits (user_id, total_credits, used_credits, daily_free_credits)
        VALUES (reset_daily_credits.user_id, 5, 0, 5)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Create trigger to update updated_at column
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint on user_id
ALTER TABLE public.user_credits ADD CONSTRAINT user_credits_user_id_unique UNIQUE (user_id);
