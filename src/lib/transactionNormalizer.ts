export interface NormalizedTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  source: 'traditional' | 'crypto' | 'manual' | 'investment';
  description: string;
  metadata: Record<string, any>;
}

export const normalizeTransaction = (
  transaction: any,
  source: 'traditional' | 'crypto' | 'manual' | 'investment'
): NormalizedTransaction => {
  // Handle traditional banking transactions
  if (source === 'traditional') {
    return {
      id: transaction.id,
      date: transaction.date || transaction.transaction_date,
      amount: transaction.amount,
      type: transaction.type || (transaction.amount > 0 ? 'income' : 'expense'),
      category: transaction.category || 'uncategorized',
      source: 'traditional',
      description: transaction.description || transaction.merchant_name || '',
      metadata: {
        account_id: transaction.account_id,
        merchant: transaction.merchant_name,
        original_data: transaction,
      },
    };
  }

  // Handle crypto transactions
  if (source === 'crypto') {
    let type: 'income' | 'expense' | 'transfer' = 'transfer';
    let category = 'crypto_transfer';

    if (transaction.transaction_type === 'receive') {
      type = 'income';
      category = 'crypto_received';
    } else if (transaction.transaction_type === 'send') {
      type = 'expense';
      category = 'crypto_sent';
    } else if (transaction.transaction_type === 'swap') {
      type = 'transfer';
      category = 'crypto_swap';
    }

    return {
      id: transaction.id,
      date: transaction.block_timestamp || transaction.created_at,
      amount: parseFloat(transaction.value || 0),
      type,
      category,
      source: 'crypto',
      description: `${transaction.transaction_type} - ${transaction.token_symbol || 'Token'}`,
      metadata: {
        wallet_id: transaction.wallet_id,
        token_symbol: transaction.token_symbol,
        token_address: transaction.token_address,
        transaction_hash: transaction.transaction_hash,
        gas_used: transaction.gas_used,
        gas_price: transaction.gas_price,
        original_data: transaction,
      },
    };
  }

  // Handle investment transactions
  if (source === 'investment') {
    return {
      id: transaction.id,
      date: transaction.transaction_date || transaction.created_at,
      amount: transaction.amount || transaction.value,
      type: transaction.transaction_type === 'buy' ? 'expense' : 'income',
      category: 'investment',
      source: 'investment',
      description: `${transaction.transaction_type} - ${transaction.asset_name}`,
      metadata: {
        investment_id: transaction.investment_id,
        asset_name: transaction.asset_name,
        shares: transaction.shares,
        original_data: transaction,
      },
    };
  }

  // Handle manual entries (fallback)
  return {
    id: transaction.id,
    date: transaction.date || transaction.created_at,
    amount: transaction.amount,
    type: transaction.type || 'expense',
    category: transaction.category || 'uncategorized',
    source: 'manual',
    description: transaction.description || '',
    metadata: {
      original_data: transaction,
    },
  };
};
