-- Add data_source_metadata column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS data_source_metadata JSONB DEFAULT '{}';

-- Create materialized view for total assets
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_total_assets AS
SELECT 
  user_id,
  SUM(CASE WHEN account_type = 'traditional' THEN balance ELSE 0 END) as traditional_balance,
  SUM(CASE WHEN account_type = 'crypto' THEN balance ELSE 0 END) as crypto_balance,
  SUM(CASE WHEN account_type = 'investment' THEN balance ELSE 0 END) as investment_balance,
  SUM(balance) as total_assets,
  NOW() as last_updated
FROM (
  -- Traditional accounts
  SELECT 
    user_id,
    'traditional' as account_type,
    SUM(balance) as balance
  FROM accounts
  GROUP BY user_id
  
  UNION ALL
  
  -- Crypto holdings
  SELECT 
    cw.user_id,
    'crypto' as account_type,
    SUM(ch.value_usd) as balance
  FROM crypto_holdings ch
  JOIN crypto_wallets cw ON ch.wallet_id = cw.id
  GROUP BY cw.user_id
  
  UNION ALL
  
  -- Investments
  SELECT 
    user_id,
    'investment' as account_type,
    SUM(quantity * purchase_price) as balance
  FROM investment_portfolio
  GROUP BY user_id
) combined
GROUP BY user_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS mv_user_total_assets_user_id_idx 
ON mv_user_total_assets(user_id);

-- Create materialized view for cash flow
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_cash_flow AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) as month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -ABS(amount) END) as net_cash_flow
FROM transactions
WHERE date >= NOW() - INTERVAL '12 months'
GROUP BY user_id, DATE_TRUNC('month', date);

-- Create index
CREATE INDEX IF NOT EXISTS mv_user_cash_flow_user_id_month_idx 
ON mv_user_cash_flow(user_id, month);

-- Create materialized view for category spending
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_category_spending AS
SELECT 
  user_id,
  category,
  DATE_TRUNC('month', date) as month,
  COUNT(*) as transaction_count,
  SUM(ABS(amount)) as total_spent,
  AVG(ABS(amount)) as avg_transaction
FROM transactions
WHERE type = 'expense' 
  AND date >= NOW() - INTERVAL '12 months'
GROUP BY user_id, category, DATE_TRUNC('month', date);

-- Create index
CREATE INDEX IF NOT EXISTS mv_user_category_spending_user_id_idx 
ON mv_user_category_spending(user_id, category, month);

-- Create function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_financial_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_total_assets;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_cash_flow;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_category_spending;
END;
$$ LANGUAGE plpgsql;