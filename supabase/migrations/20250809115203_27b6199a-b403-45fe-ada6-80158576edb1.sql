-- Create tax_calendar_events table for tax calendar feature
CREATE TABLE IF NOT EXISTS public.tax_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_entity_id UUID NULL,
  event_title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  due_date DATE NOT NULL,
  description TEXT NULL,
  amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  reminder_days INTEGER[] DEFAULT '{30,7,1}',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tax_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own tax calendar events"
ON public.tax_calendar_events
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax calendar events"
ON public.tax_calendar_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax calendar events"
ON public.tax_calendar_events
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax calendar events"
ON public.tax_calendar_events
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_tax_calendar_events_updated_at ON public.tax_calendar_events;
CREATE TRIGGER update_tax_calendar_events_updated_at
BEFORE UPDATE ON public.tax_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_tax_calendar_events_user ON public.tax_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calendar_events_event_date ON public.tax_calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_tax_calendar_events_due_date ON public.tax_calendar_events(due_date);