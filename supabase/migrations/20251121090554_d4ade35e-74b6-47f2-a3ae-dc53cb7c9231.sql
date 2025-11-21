-- Phase 3: Database Optimizations (Corrected)
-- Add indexes for improved chart query performance

-- Index for transaction queries by user and date
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON public.transactions(user_id, date DESC);

-- Index for transaction queries by user, type, and date
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date 
ON public.transactions(user_id, type, date DESC);

-- Index for documents by user and processing status
CREATE INDEX IF NOT EXISTS idx_documents_user_status 
ON public.documents(user_id, processing_status);

-- Index for investment portfolio queries by user and date
CREATE INDEX IF NOT EXISTS idx_investment_user_date 
ON public.investment_portfolio(user_id, purchase_date DESC);

-- Index for crypto wallets by user
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user 
ON public.crypto_wallets(user_id);

-- Index for analytics cache lookups
CREATE INDEX IF NOT EXISTS idx_analytics_cache_lookup 
ON public.analytics_cache(cache_key, user_id, expires_at);

-- Index for voice entries by user and status
CREATE INDEX IF NOT EXISTS idx_voice_entries_user_status 
ON public.voice_entries(user_id, status);

-- Index for financial goals queries
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_achieved 
ON public.financial_goals(user_id, is_achieved);

-- Add comments explaining the optimizations
COMMENT ON INDEX idx_transactions_user_date IS 'Optimizes chart queries that fetch transactions by user and date range';
COMMENT ON INDEX idx_analytics_cache_lookup IS 'Speeds up cache lookups for chart data to reduce database load';