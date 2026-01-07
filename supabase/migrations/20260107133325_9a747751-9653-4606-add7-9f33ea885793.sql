-- =============================================
-- FIX OVERLY PERMISSIVE RLS POLICIES (Part 1 - Crypto)
-- Drop existing policies first, then create proper ones
-- =============================================

-- crypto_nfts - Drop the bad policy and any existing ones to recreate
DROP POLICY IF EXISTS "System can manage NFTs" ON public.crypto_nfts;
DROP POLICY IF EXISTS "Users can view their own NFTs" ON public.crypto_nfts;
DROP POLICY IF EXISTS "Users can insert their own NFTs" ON public.crypto_nfts;
DROP POLICY IF EXISTS "Users can update their own NFTs" ON public.crypto_nfts;
DROP POLICY IF EXISTS "Users can delete their own NFTs" ON public.crypto_nfts;

CREATE POLICY "Users can view their own NFTs" 
ON public.crypto_nfts 
FOR SELECT 
USING (
  wallet_id IN (SELECT id FROM public.crypto_wallets WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their own NFTs"
ON public.crypto_nfts
FOR INSERT
WITH CHECK (
  wallet_id IN (SELECT id FROM public.crypto_wallets WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own NFTs"
ON public.crypto_nfts
FOR UPDATE
USING (
  wallet_id IN (SELECT id FROM public.crypto_wallets WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own NFTs"
ON public.crypto_nfts
FOR DELETE
USING (
  wallet_id IN (SELECT id FROM public.crypto_wallets WHERE user_id = auth.uid())
);

-- crypto_transactions
DROP POLICY IF EXISTS "System can manage transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Users can view their own crypto transactions" ON public.crypto_transactions;
DROP POLICY IF EXISTS "Users can insert their own crypto transactions" ON public.crypto_transactions;

CREATE POLICY "Users can view their own crypto transactions"
ON public.crypto_transactions
FOR SELECT
USING (
  wallet_id IN (SELECT id FROM public.crypto_wallets WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert their own crypto transactions"
ON public.crypto_transactions
FOR INSERT
WITH CHECK (
  wallet_id IN (SELECT id FROM public.crypto_wallets WHERE user_id = auth.uid())
);

-- hmrc_tokens
DROP POLICY IF EXISTS "Service role can manage tokens" ON public.hmrc_tokens;
DROP POLICY IF EXISTS "Users can view their own HMRC tokens" ON public.hmrc_tokens;
DROP POLICY IF EXISTS "Users can insert their own HMRC tokens" ON public.hmrc_tokens;
DROP POLICY IF EXISTS "Users can update their own HMRC tokens" ON public.hmrc_tokens;
DROP POLICY IF EXISTS "Users can delete their own HMRC tokens" ON public.hmrc_tokens;

CREATE POLICY "Users can view their own HMRC tokens"
ON public.hmrc_tokens
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own HMRC tokens"
ON public.hmrc_tokens
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own HMRC tokens"
ON public.hmrc_tokens
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own HMRC tokens"
ON public.hmrc_tokens
FOR DELETE
USING (user_id = auth.uid());

-- ai_usage_logs
DROP POLICY IF EXISTS "System can insert AI usage logs" ON public.ai_usage_logs;
DROP POLICY IF EXISTS "Users can insert their own AI usage logs" ON public.ai_usage_logs;

CREATE POLICY "Users can insert their own AI usage logs"
ON public.ai_usage_logs
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- arnold_notifications
DROP POLICY IF EXISTS "Service role can create notifications" ON public.arnold_notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.arnold_notifications;

CREATE POLICY "Users can insert their own notifications"
ON public.arnold_notifications
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- payment_webhook_logs - service role only
DROP POLICY IF EXISTS "Service role can manage webhook logs" ON public.payment_webhook_logs;

CREATE POLICY "Service role can manage webhook logs"
ON public.payment_webhook_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- waitlist - email validation
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;

CREATE POLICY "Anyone can join waitlist"
ON public.waitlist
FOR INSERT
WITH CHECK (
  email IS NOT NULL AND 
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- performance_metrics
DROP POLICY IF EXISTS "System can insert performance metrics" ON public.performance_metrics;
DROP POLICY IF EXISTS "Users can insert their own performance metrics" ON public.performance_metrics;

CREATE POLICY "Users can insert their own performance metrics"
ON public.performance_metrics
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- api_usage_logs - service role only for insert
DROP POLICY IF EXISTS "Service role can insert usage logs" ON public.api_usage_logs;

CREATE POLICY "Service role can insert usage logs"
ON public.api_usage_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- security_audit_logs - consolidate duplicates
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Service role can insert security logs" ON public.security_audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.security_audit_logs;

CREATE POLICY "Service role can insert security logs"
ON public.security_audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can view their own security audit logs"
ON public.security_audit_logs
FOR SELECT
USING (user_id = auth.uid());