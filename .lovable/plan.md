
# Investor Demo Mode Implementation Plan

## Overview
Create a comprehensive **Investor Demo Mode** that simulates connected bank accounts with realistic transactions, allowing you to demonstrate AccountantAI's features during investor presentations without requiring real financial data.

---

## Architecture Design

The demo mode will be implemented as a **toggle-based system** that:
1. Creates realistic demo bank connections and accounts in the database (tagged with `is_demo: true`)
2. Populates them with meaningful transactions showing various use cases
3. Provides easy activation/deactivation from a dedicated Demo Control Panel
4. Clearly labels demo data with visual badges to distinguish from real data
5. Auto-cleans up demo data when deactivated

---

## Demo Data Structure

### Simulated Bank Accounts (5 accounts covering key regions)

| Bank Name | Type | Region | Balance | Provider |
|-----------|------|--------|---------|----------|
| Chase Business Checking | Checking | US | $45,230.50 | Plaid |
| Bank of America Savings | Savings | US | $125,000.00 | Plaid |
| Barclays UK Premium | Checking | UK | £32,450.75 | TrueLayer |
| GTBank Nigeria Business | Checking | Nigeria | ₦2,850,000 | Mono |
| HDFC India Salary | Savings | India | ₹485,000 | Setu |

### Simulated Transactions (100+ realistic transactions)
- **Income transactions**: Salary deposits, client payments, investment returns
- **Expense transactions**: Rent, utilities, software subscriptions, office supplies
- **Recurring transactions**: Monthly subscriptions, loan payments
- **Large transactions**: Quarterly tax payments, equipment purchases
- **Various categories**: Food, Transport, Entertainment, Healthcare, Business Expenses

---

## Implementation Phases

### Phase 1: Demo Mode Infrastructure

**New Files:**
- `src/hooks/useDemoMode.tsx` - Core demo mode state management
- `src/components/demo/DemoModeContext.tsx` - React context for global demo state
- `src/lib/demoData.ts` - Demo accounts, transactions, and bank connections data

**Features:**
- Global demo mode toggle
- localStorage persistence for demo state
- Visual indicator when demo mode is active
- Protection against mixing demo and real data

### Phase 2: Demo Data Configuration

**New File: `src/lib/demoData.ts`**

Contains all demo data generators:

```text
DEMO ACCOUNTS:
┌─────────────────────────────────────────────────────────────────┐
│ Chase Business Checking  │ $45,230.50  │ US    │ Plaid        │
│ Bank of America Savings  │ $125,000.00 │ US    │ Plaid        │
│ Barclays UK Premium      │ £32,450.75  │ UK    │ TrueLayer    │
│ GTBank Nigeria Business  │ ₦2,850,000  │ Nigeria│ Mono        │
│ HDFC India Salary        │ ₹485,000    │ India │ Setu         │
└─────────────────────────────────────────────────────────────────┘

DEMO TRANSACTIONS (sample):
├── 3 days ago: Amazon Web Services ($299.00) - Software
├── 5 days ago: Salary Deposit ($8,500.00) - Income  
├── 7 days ago: Office Rent ($2,500.00) - Business
├── 10 days ago: Client Payment ($15,000.00) - Income
├── 14 days ago: Quarterly Tax ($4,250.00) - Tax
└── ... 100+ more realistic transactions
```

### Phase 3: Demo Control Panel

**New File: `src/components/demo/DemoControlPanel.tsx`**

Features:
- One-click "Start Demo" button
- Progress indicator during data loading
- "Reset Demo" to regenerate fresh data
- "End Demo" to clean up all demo data
- Quick stats showing demo data counts
- Warning badges when demo mode is active

**Location:** Accessible from:
- Settings page (new "Demo Mode" tab)
- Quick-access button in header (for presenters)

### Phase 4: Demo Bank Connections

**New File: `src/components/demo/DemoBankConnectionCard.tsx`**

Simulates the bank connection experience:
- Shows realistic connected bank logos and names
- Displays "Connected via [Provider]" with provider logos
- Shows last sync timestamp
- Balance display with proper currency formatting
- "Sync Now" button with animation (simulated)

### Phase 5: Visual Demo Indicators

**Modifications to existing files:**

1. **Dashboard.tsx** - Add demo mode banner at top
2. **Accounts.tsx** - Show "DEMO" badge on demo accounts
3. **RecentTransactions.tsx** - Tag demo transactions
4. **Sidebar/Header** - Show "DEMO MODE" indicator

**Demo Badge Component:**
```text
┌──────────────────────┐
│ 🎬 DEMO MODE ACTIVE │
│ For presentation use │
└──────────────────────┘
```

### Phase 6: Data Isolation & Cleanup

**Database approach:**
- Add `is_demo: true` in metadata for demo records
- Demo data uses special prefixed IDs for easy identification
- Cleanup function removes all demo-tagged records
- RLS policies ensure demo data only visible to owner

**Cleanup triggers:**
- Manual "End Demo" button
- Auto-cleanup after 24 hours (optional)
- Session-based cleanup on logout (optional)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/DemoModeContext.tsx` | Global demo mode state provider |
| `src/hooks/useDemoMode.tsx` | Demo mode hook with activation/deactivation |
| `src/lib/demoData.ts` | All demo data definitions and generators |
| `src/components/demo/DemoControlPanel.tsx` | Main demo control interface |
| `src/components/demo/DemoBankCard.tsx` | Demo bank account display card |
| `src/components/demo/DemoModeBanner.tsx` | Header banner when demo is active |
| `src/components/demo/DemoBadge.tsx` | Small badge component for demo items |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Wrap with DemoModeContext provider |
| `src/pages/Settings.tsx` | Add Demo Mode tab with control panel |
| `src/pages/Dashboard.tsx` | Show DemoModeBanner when active |
| `src/pages/Accounts.tsx` | Display DemoBadge on demo accounts |
| `src/components/dashboard/RecentTransactions.tsx` | Tag demo transactions |
| `src/components/Sidebar.tsx` | Show demo mode indicator |
| `src/components/mobile/MobileHeader.tsx` | Add demo mode quick toggle |

---

## Demo Activation Flow

```text
User Flow:
┌─────────────────────────────────────────────────────────────────┐
│  1. Navigate to Settings → Demo Mode                           │
│  2. Click "Start Investor Demo"                                │
│  3. System creates demo accounts & transactions                │
│  4. Dashboard shows demo data with visual indicators           │
│  5. Present features to investors                              │
│  6. Click "End Demo" to clean up                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Demo Features to Showcase

With the demo mode active, you can demonstrate:

1. **Multi-Bank Connectivity** - Show 5 connected banks from different regions
2. **Transaction Categorization** - Pre-categorized transactions in various categories
3. **Dashboard Analytics** - Real-looking charts and metrics
4. **AI Insights** - Arnold can analyze demo data and provide recommendations
5. **Net Worth Tracking** - Combined balance across all demo accounts
6. **Regional Support** - Different currencies (USD, GBP, NGN, INR)
7. **Bank Sync** - Simulated sync button with animation

---

## Technical Details

### Demo Data Metadata Structure
```typescript
{
  is_demo: true,
  demo_session_id: "demo_2026_01_25_abc123",
  demo_provider: "plaid" | "truelayer" | "mono" | "setu",
  demo_created_at: "2026-01-25T12:00:00Z"
}
```

### Demo Account Naming Convention
- Prefix: `[DEMO]` in account names (optional, for database queries)
- Visual badge in UI only (cleaner presentation)

### Currency Support
Demo accounts will use proper currency formatting:
- US accounts → USD ($)
- UK accounts → GBP (£)
- Nigeria accounts → NGN (₦)
- India accounts → INR (₹)

---

## Mobile Responsiveness

All demo components will be:
- Touch-friendly with 44px minimum targets
- Responsive layouts for all screen sizes
- Drawer-based modals on mobile
- Swipe-to-dismiss gestures supported

---

## Safety Features

1. **Demo data isolation** - Demo records tagged and easily filterable
2. **No real data mixing** - Demo and real accounts clearly separated
3. **Easy cleanup** - One-click removal of all demo data
4. **Visual warnings** - Clear indicators prevent confusion
5. **Presenter mode** - Optional hide real data toggle for demos

---

## Expected Results

After implementation:
- You can instantly populate AccountantAI with realistic demo data
- All features work with demo data (charts, AI, analytics)
- Investors see a fully functional product experience
- One-click cleanup returns to clean state
- Demo data persists across page refreshes during presentation
- Clear visual distinction between demo and real data
