-- Create saved_tax_calculations table for storing user tax calculation history
CREATE TABLE IF NOT EXISTS public.saved_tax_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country TEXT NOT NULL,
  income NUMERIC NOT NULL,
  filing_status TEXT,
  total_tax NUMERIC NOT NULL,
  effective_rate NUMERIC NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  calculation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_tax_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_tax_calculations
CREATE POLICY "Users can insert their own tax calculations"
  ON public.saved_tax_calculations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tax calculations"
  ON public.saved_tax_calculations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax calculations"
  ON public.saved_tax_calculations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax calculations"
  ON public.saved_tax_calculations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_tax_calculations_user_id 
  ON public.saved_tax_calculations(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_tax_calculations_calculation_date 
  ON public.saved_tax_calculations(calculation_date DESC);