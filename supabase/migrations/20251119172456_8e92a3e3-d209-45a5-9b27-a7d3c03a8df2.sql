-- Fix Critical Security Issues: API Credentials Exposure and Public Crypto Holdings
-- Step 1: Clean up all existing policies

-- Drop all existing crypto_holdings policies
DROP POLICY IF EXISTS "System can manage holdings" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can manage their own crypto holdings" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can view their own crypto holdings" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can view their wallet holdings" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Service role can manage crypto holdings" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can insert holdings for their wallets" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can update their wallet holdings" ON public.crypto_holdings;
DROP POLICY IF EXISTS "Users can delete their wallet holdings" ON public.crypto_holdings;

-- Drop all existing integration_connections policies
DROP POLICY IF EXISTS "Users can manage their own connections" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can view their own connections" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can create their own integration connections" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can update their own integration connections" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can delete their own integration connections" ON public.integration_connections;
DROP POLICY IF EXISTS "Users can view their own integration connections" ON public.integration_connections;
DROP POLICY IF EXISTS "Service role can manage integration connections" ON public.integration_connections;

-- Step 2: Create secure RLS policies for crypto_holdings

-- Service role access for background operations
CREATE POLICY "Service role can manage crypto holdings"
ON public.crypto_holdings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can only view their own wallet holdings
CREATE POLICY "Users can view their wallet holdings"
ON public.crypto_holdings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM crypto_wallets
    WHERE crypto_wallets.id = crypto_holdings.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  )
);

-- Users can insert holdings for their wallets
CREATE POLICY "Users can insert holdings for their wallets"
ON public.crypto_holdings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM crypto_wallets
    WHERE crypto_wallets.id = crypto_holdings.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  )
);

-- Users can update their wallet holdings
CREATE POLICY "Users can update their wallet holdings"
ON public.crypto_holdings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM crypto_wallets
    WHERE crypto_wallets.id = crypto_holdings.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM crypto_wallets
    WHERE crypto_wallets.id = crypto_holdings.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  )
);

-- Users can delete their wallet holdings
CREATE POLICY "Users can delete their wallet holdings"
ON public.crypto_holdings
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM crypto_wallets
    WHERE crypto_wallets.id = crypto_holdings.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  )
);

-- Step 3: Create secure RLS policies for integration_connections

-- Add encryption warning comment
COMMENT ON COLUMN public.integration_connections.credentials IS 
'SECURITY: Stores encrypted third-party API credentials. Must be encrypted before storage.';

-- Service role access for background sync operations
CREATE POLICY "Service role can manage integration connections"
ON public.integration_connections
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own connections
CREATE POLICY "Users can view their own connections"
ON public.integration_connections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own connections
CREATE POLICY "Users can create their own connections"
ON public.integration_connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their own connections"
ON public.integration_connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own connections"
ON public.integration_connections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);