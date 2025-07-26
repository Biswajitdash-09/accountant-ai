
-- Phase 1: Fix Currency System Database Issues

-- First, let's ensure all users have a default currency preference
-- Update user preferences to set default currency to USD base currency for users without preferences
INSERT INTO public.user_preferences (user_id, default_currency_id, timezone, date_format, fiscal_year_start)
SELECT 
    p.id as user_id,
    c.id as default_currency_id,
    'UTC' as timezone,
    'MM/DD/YYYY' as date_format,
    '2024-01-01' as fiscal_year_start
FROM public.profiles p
CROSS JOIN (SELECT id FROM public.currencies WHERE is_base = true LIMIT 1) c
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_preferences up WHERE up.user_id = p.id
);

-- Update all transactions that don't have a currency_id to use the user's default currency
UPDATE public.transactions t
SET currency_id = (
    SELECT up.default_currency_id 
    FROM public.user_preferences up 
    WHERE up.user_id = t.user_id
)
WHERE t.currency_id IS NULL
AND EXISTS (
    SELECT 1 FROM public.user_preferences up 
    WHERE up.user_id = t.user_id 
    AND up.default_currency_id IS NOT NULL
);

-- For users without preferences, set to base currency
UPDATE public.transactions t
SET currency_id = (SELECT id FROM public.currencies WHERE is_base = true LIMIT 1)
WHERE t.currency_id IS NULL;

-- Update revenue streams to use default currency
UPDATE public.revenue_streams rs
SET currency_id = (
    SELECT up.default_currency_id 
    FROM public.user_preferences up 
    WHERE up.user_id = rs.user_id
)
WHERE rs.currency_id IS NULL;

-- Update financial goals to use default currency
UPDATE public.financial_goals fg
SET currency_id = (
    SELECT up.default_currency_id 
    FROM public.user_preferences up 
    WHERE up.user_id = fg.user_id
)
WHERE fg.currency_id IS NULL;

-- Update balance sheet items to use default currency
UPDATE public.balance_sheet_items bsi
SET currency_id = (
    SELECT up.default_currency_id 
    FROM public.user_preferences up 
    WHERE up.user_id = bsi.user_id
)
WHERE bsi.currency_id IS NULL;

-- Add constraints to ensure currency_id is not null for new records
ALTER TABLE public.transactions 
ALTER COLUMN currency_id SET NOT NULL;

-- Create a trigger to automatically set currency_id for new transactions
CREATE OR REPLACE FUNCTION public.set_default_currency()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.currency_id IS NULL THEN
        NEW.currency_id := (
            SELECT default_currency_id 
            FROM public.user_preferences 
            WHERE user_id = NEW.user_id
        );
        
        -- Fallback to base currency if no user preference
        IF NEW.currency_id IS NULL THEN
            NEW.currency_id := (SELECT id FROM public.currencies WHERE is_base = true LIMIT 1);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to set default currency on insert
CREATE TRIGGER set_default_currency_transactions
    BEFORE INSERT ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_currency();

CREATE TRIGGER set_default_currency_revenue_streams
    BEFORE INSERT ON public.revenue_streams
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_currency();

CREATE TRIGGER set_default_currency_financial_goals
    BEFORE INSERT ON public.financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_currency();

CREATE TRIGGER set_default_currency_balance_sheet_items
    BEFORE INSERT ON public.balance_sheet_items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_default_currency();

-- Create user_sessions table for session management
CREATE TABLE public.user_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    session_token TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for sessions
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Add notification preferences to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN notification_preferences JSONB DEFAULT '{
    "email_notifications": true,
    "push_notifications": true,
    "tax_reminders": true,
    "goal_updates": true,
    "security_alerts": true
}'::jsonb;

-- Add security audit log
CREATE TABLE public.security_audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    action_description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security audit logs
CREATE POLICY "Users can view their own audit logs" ON public.security_audit_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit logs" ON public.security_audit_logs
  FOR INSERT WITH CHECK (true);

-- Create index for audit logs
CREATE INDEX idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    p_user_id UUID,
    p_action_type TEXT,
    p_action_description TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.security_audit_logs (
        user_id, 
        action_type, 
        action_description, 
        ip_address, 
        user_agent, 
        metadata
    )
    VALUES (
        p_user_id, 
        p_action_type, 
        p_action_description, 
        p_ip_address, 
        p_user_agent, 
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
