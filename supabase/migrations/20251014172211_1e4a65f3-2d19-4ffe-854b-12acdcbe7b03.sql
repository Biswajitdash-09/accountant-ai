-- Create AI usage logs table
CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  model text NOT NULL,
  tokens_used integer NOT NULL,
  cost_estimate numeric(10, 4),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own AI usage logs"
  ON public.ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert logs
CREATE POLICY "System can insert AI usage logs"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_ai_usage_logs_user_created ON public.ai_usage_logs(user_id, created_at DESC);