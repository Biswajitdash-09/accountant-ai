-- Create oauth_states table for secure OAuth callback handling
CREATE TABLE IF NOT EXISTS public.oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '15 minutes')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON public.oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_provider ON public.oauth_states(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_states_user_id ON public.oauth_states(user_id);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own states
CREATE POLICY "Users can insert their own oauth states"
ON public.oauth_states
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own states
CREATE POLICY "Users can view their own oauth states"
ON public.oauth_states
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can access all (for callback functions)
CREATE POLICY "Service role can access all oauth states"
ON public.oauth_states
FOR ALL
USING (auth.role() = 'service_role');