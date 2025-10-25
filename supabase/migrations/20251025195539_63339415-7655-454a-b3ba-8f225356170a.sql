-- Add onboarding and region fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS region TEXT CHECK (region IN ('UK', 'US', 'India', 'Nigeria')),
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiscal_year_end DATE,
ADD COLUMN IF NOT EXISTS accounting_software TEXT,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Create index for faster queries on onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_completed);

-- Create index for region-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);

COMMENT ON COLUMN public.profiles.region IS 'User region for tax and banking: UK, US, India, Nigeria';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether user has completed initial onboarding flow';
COMMENT ON COLUMN public.profiles.onboarding_step IS 'Current step in onboarding process (0-4)';
COMMENT ON COLUMN public.profiles.fiscal_year_end IS 'User fiscal year end date for accounting';
COMMENT ON COLUMN public.profiles.accounting_software IS 'Connected accounting software: QuickBooks, Xero, Zoho';
COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language code';