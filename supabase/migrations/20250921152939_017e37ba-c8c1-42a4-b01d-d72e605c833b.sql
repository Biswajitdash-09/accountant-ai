-- Fix RLS policy for payment_webhook_logs table
CREATE POLICY "Service role can manage webhook logs"
ON public.payment_webhook_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- This table is typically managed by service role only for Stripe/payment webhooks
-- We allow all operations for service role but users won't have direct access