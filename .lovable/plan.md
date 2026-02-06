

# Complete Demo Mode Fix Plan

## Root Cause Analysis

The "Failed to activate demo mode" error is caused by **3 critical database schema mismatches**:

### Issue 1: Wrong Column Name for Transactions
- **Code uses**: `metadata` field when inserting transactions
- **Database has**: `data_source_metadata` (JSONB column)
- **Result**: Insert fails with column not found

### Issue 2: Accounts Table Missing Metadata
- **Code tries to insert**: `metadata: { is_demo: true, demo_session_id: ... }`
- **Database schema**: `accounts` table has NO `metadata` column
- **Result**: Insert fails with unknown column error

### Issue 3: Currency ID Required
- **Database**: `currency_id` is **NOT NULL** in transactions table
- **Code**: Passes `defaultCurrency?.id` which could be undefined if query fails
- **Result**: Insert may fail with null constraint violation

---

## Solution Architecture

### Phase 1: Fix DemoModeContext.tsx
Update the database operations to use correct column names:

**Changes:**
1. Use `data_source_metadata` instead of `metadata` for transactions
2. Remove `metadata` from accounts insert (column doesn't exist)
3. Fetch currency ID upfront and handle missing case
4. Add proper error handling with detailed console logging
5. Use account name pattern `[DEMO]` prefix for identification instead of metadata

### Phase 2: Fix demoData.ts
Update the data generators to produce correct schema-compliant data:

**Changes:**
1. Remove `metadata` from `DemoAccount` interface and generator
2. Add `[DEMO]` prefix to account names for identification
3. Update `DemoTransaction` to use `data_source_metadata` instead of `metadata`
4. Ensure `currency_id` is always provided

### Phase 3: Improve Error Handling & UX
Add robust error handling and visual feedback:

**Changes:**
1. Add detailed error messages in toast notifications
2. Show loading progress with step indicators
3. Add retry mechanism for failed operations
4. Console log all errors for debugging

### Phase 4: Fix Cleanup Logic
Update deactivation to use correct query patterns:

**Changes:**
1. Delete transactions using `data_source_metadata` contains check
2. Delete accounts by name pattern matching `[DEMO]%`
3. Add proper error recovery if partial cleanup fails

---

## Detailed Code Changes

### File 1: `src/contexts/DemoModeContext.tsx`

**Key fixes:**

```typescript
// BEFORE (broken):
const { error: txError } = await supabase
  .from('transactions')
  .insert(allTransactions.map(tx => ({
    // ...
    metadata: tx.metadata,  // WRONG - column doesn't exist
  })));

// AFTER (fixed):
const { error: txError } = await supabase
  .from('transactions')
  .insert(allTransactions.map(tx => ({
    // ...
    data_source_metadata: {
      is_demo: true,
      demo_session_id: sessionId,
    },
  })));
```

**Account identification fix:**

```typescript
// BEFORE (broken):
accounts.map(acc => ({
  // ...
  metadata: { is_demo: true, demo_session_id: sessionId }, // WRONG
}))

// AFTER (fixed):
accounts.map(acc => ({
  user_id: user.id,
  account_name: acc.account_name, // Already prefixed with [DEMO]
  account_type: acc.account_type,
  balance: acc.balance,
  currency_id: acc.currency_id,
}))
```

**Currency ID fix:**

```typescript
// Fetch currency upfront with fallback
const { data: currencies } = await supabase
  .from('currencies')
  .select('id, code')
  .in('code', ['USD', 'GBP', 'NGN', 'INR']);

const currencyMap = new Map(
  currencies?.map(c => [c.code, c.id]) || []
);

// Use appropriate currency for each account
const currencyId = currencyMap.get('USD') || currencies?.[0]?.id;
```

### File 2: `src/lib/demoData.ts`

**Update interfaces and generators:**

```typescript
// DemoAccount - remove metadata
export interface DemoAccount {
  account_name: string;  // Will be prefixed with [DEMO]
  account_type: string;
  balance: number;
  currency_id: string | null;
  currency_code: string;  // Add currency code for mapping
}

// DemoTransaction - use data_source_metadata
export interface DemoTransaction {
  // ...
  data_source_metadata: {
    is_demo: true;
    demo_session_id: string;
  };
}
```

**Account generator update:**

```typescript
export const generateDemoAccounts = (userId: string, sessionId: string): Omit<DemoAccount, 'currency_id'>[] => {
  return [
    {
      account_name: '[DEMO] Chase Business Checking',
      account_type: 'Checking',
      balance: 45230.50,
      currency_code: 'USD',
    },
    // ... other accounts with [DEMO] prefix
  ];
};
```

### File 3: `src/components/demo/DemoControlPanel.tsx`

**Enhance with progress indicator:**

Add a visual step-by-step progress when activating demo mode:
- Step 1: Creating bank connections...
- Step 2: Creating accounts...
- Step 3: Generating transactions...
- Step 4: Demo ready!

### Phase 5: Update Cleanup Logic

**Delete accounts by name pattern:**

```typescript
// Delete demo accounts (by name pattern since no metadata column)
await supabase
  .from('accounts')
  .delete()
  .eq('user_id', user.id)
  .like('account_name', '[DEMO]%');

// Delete demo transactions (by data_source_metadata)
await supabase
  .from('transactions')
  .delete()
  .eq('user_id', user.id)
  .contains('data_source_metadata', { is_demo: true });
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/DemoModeContext.tsx` | Fix column names, add proper currency handling, improve error messages |
| `src/lib/demoData.ts` | Update interfaces, add [DEMO] prefix to accounts, use data_source_metadata |
| `src/components/demo/DemoControlPanel.tsx` | Add progress indicator, better error display |

---

## Visual Enhancements

### Progress Steps During Activation

```text
┌─────────────────────────────────────────────┐
│  🏦 Creating bank connections...     ✓      │
│  📊 Creating accounts...             ✓      │
│  💰 Generating transactions...       ⏳     │
│  ✅ Demo ready!                             │
└─────────────────────────────────────────────┘
```

### Enhanced Error Display

When errors occur, show:
- Clear error message in toast
- Details logged to console for debugging
- Retry button available
- Partial cleanup on failure

---

## Technical Details

### Currency Mapping Strategy

Create proper multi-currency support:

```typescript
const currencyMapping = {
  'Chase Business Checking': 'USD',
  'Bank of America Savings': 'USD', 
  'Barclays UK Premium': 'GBP',
  'GTBank Nigeria Business': 'NGN',
  'HDFC India Salary': 'INR',
};
```

### Demo Data Identification

Since accounts table has no metadata column:
- **Accounts**: Identified by `[DEMO]` prefix in account_name
- **Transactions**: Identified by `data_source_metadata.is_demo = true`
- **Bank Connections**: Identified by `metadata.is_demo = true` (this table HAS metadata)

---

## Expected Results

After implementation:
1. "Start Investor Demo" button will work correctly
2. 5 multi-regional bank connections created
3. 5 corresponding accounts created
4. 100+ transactions generated across accounts
5. All demo data cleanly tagged for easy cleanup
6. One-click cleanup fully functional
7. Clear visual progress during activation

