import { supabase } from "@/integrations/supabase/client";

export interface SampleTransaction {
  description: string;
  amount: number;
  transaction_type: "income" | "expense";
  category: string;
  date: string;
}

export interface SampleCryptoTransaction {
  token_symbol: string;
  transaction_type: string;
  value: number;
  from_address: string;
  to_address: string;
  transaction_hash: string;
}

export const sampleTransactions: SampleTransaction[] = [
  // Income
  { description: "Monthly Salary", amount: 5000, transaction_type: "income", category: "Salary", date: "2024-01-15" },
  { description: "Freelance Project Payment", amount: 1200, transaction_type: "income", category: "Freelance", date: "2024-01-20" },
  { description: "Investment Dividends", amount: 350, transaction_type: "income", category: "Investment", date: "2024-01-25" },
  
  // Housing Expenses
  { description: "Rent Payment", amount: 1500, transaction_type: "expense", category: "Housing", date: "2024-01-01" },
  { description: "Electricity Bill", amount: 120, transaction_type: "expense", category: "Utilities", date: "2024-01-05" },
  { description: "Internet Service", amount: 80, transaction_type: "expense", category: "Utilities", date: "2024-01-05" },
  
  // Food & Dining
  { description: "Grocery Shopping - Walmart", amount: 250, transaction_type: "expense", category: "Groceries", date: "2024-01-08" },
  { description: "Restaurant - Olive Garden", amount: 85, transaction_type: "expense", category: "Dining", date: "2024-01-10" },
  { description: "Coffee Shop", amount: 25, transaction_type: "expense", category: "Dining", date: "2024-01-12" },
  { description: "Grocery Shopping - Whole Foods", amount: 180, transaction_type: "expense", category: "Groceries", date: "2024-01-18" },
  
  // Transportation
  { description: "Gas Station", amount: 60, transaction_type: "expense", category: "Transportation", date: "2024-01-07" },
  { description: "Uber Rides", amount: 45, transaction_type: "expense", category: "Transportation", date: "2024-01-14" },
  { description: "Car Insurance", amount: 150, transaction_type: "expense", category: "Insurance", date: "2024-01-01" },
  
  // Entertainment
  { description: "Netflix Subscription", amount: 15.99, transaction_type: "expense", category: "Entertainment", date: "2024-01-05" },
  { description: "Spotify Premium", amount: 9.99, transaction_type: "expense", category: "Entertainment", date: "2024-01-05" },
  { description: "Movie Tickets", amount: 40, transaction_type: "expense", category: "Entertainment", date: "2024-01-16" },
  
  // Shopping
  { description: "Amazon Purchase", amount: 120, transaction_type: "expense", category: "Shopping", date: "2024-01-11" },
  { description: "Clothing - H&M", amount: 95, transaction_type: "expense", category: "Shopping", date: "2024-01-19" },
  
  // Health & Fitness
  { description: "Gym Membership", amount: 50, transaction_type: "expense", category: "Health", date: "2024-01-01" },
  { description: "Pharmacy - CVS", amount: 35, transaction_type: "expense", category: "Health", date: "2024-01-13" },
  
  // Business Expenses (Tax Deductible)
  { description: "Office Supplies - Staples", amount: 75, transaction_type: "expense", category: "Business", date: "2024-01-09" },
  { description: "Software Subscription - Adobe", amount: 52.99, transaction_type: "expense", category: "Business", date: "2024-01-01" },
  { description: "Business Lunch Meeting", amount: 65, transaction_type: "expense", category: "Business", date: "2024-01-17" },
];

export const sampleCryptoTransactions: SampleCryptoTransaction[] = [
  {
    token_symbol: "ETH",
    transaction_type: "buy",
    value: 2500,
    from_address: "0x1234567890abcdef1234567890abcdef12345678",
    to_address: "0xabcdef1234567890abcdef1234567890abcdef12",
    transaction_hash: "0x" + Math.random().toString(16).substring(2, 66),
  },
  {
    token_symbol: "BTC",
    transaction_type: "buy",
    value: 5000,
    from_address: "0x1234567890abcdef1234567890abcdef12345678",
    to_address: "0xabcdef1234567890abcdef1234567890abcdef12",
    transaction_hash: "0x" + Math.random().toString(16).substring(2, 66),
  },
  {
    token_symbol: "USDC",
    transaction_type: "receive",
    value: 1000,
    from_address: "0xabcdef1234567890abcdef1234567890abcdef12",
    to_address: "0x1234567890abcdef1234567890abcdef12345678",
    transaction_hash: "0x" + Math.random().toString(16).substring(2, 66),
  },
];

export const sampleInvestments = [
  { symbol: "AAPL", quantity: 10, purchase_price: 150, purchase_date: "2023-06-15", asset_type: "stock" },
  { symbol: "GOOGL", quantity: 5, purchase_price: 120, purchase_date: "2023-08-20", asset_type: "stock" },
  { symbol: "MSFT", quantity: 8, purchase_price: 300, purchase_date: "2023-09-10", asset_type: "stock" },
  { symbol: "TSLA", quantity: 3, purchase_price: 250, purchase_date: "2023-10-05", asset_type: "stock" },
  { symbol: "SPY", quantity: 20, purchase_price: 400, purchase_date: "2023-07-01", asset_type: "etf" },
];

export const sampleGoals = [
  {
    goal_name: "Emergency Fund",
    goal_type: "savings",
    target_amount: 10000,
    current_amount: 3500,
    target_date: "2024-12-31",
    description: "Build an emergency fund covering 6 months of expenses",
    priority: "high",
  },
  {
    goal_name: "Vacation to Europe",
    goal_type: "travel",
    target_amount: 5000,
    current_amount: 1200,
    target_date: "2024-08-01",
    description: "Save for a 2-week trip to Europe",
    priority: "medium",
  },
  {
    goal_name: "Pay Off Credit Card",
    goal_type: "debt",
    target_amount: 3000,
    current_amount: 1500,
    target_date: "2024-06-30",
    description: "Eliminate credit card debt",
    priority: "high",
  },
];

export const loadSampleData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get or create default account
    let { data: accounts } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    let accountId: string;
    if (!accounts || accounts.length === 0) {
      const { data: newAccount, error: accountError } = await supabase
        .from("accounts")
        .insert({
          user_id: user.id,
          account_name: "Sample Checking Account",
          account_type: "checking",
          balance: 5000,
        })
        .select()
        .single();

      if (accountError) throw accountError;
      accountId = newAccount.id;
    } else {
      accountId = accounts[0].id;
    }

    // Get USD currency
    const { data: currencyData } = await supabase
      .from("currencies")
      .select("id")
      .eq("code", "USD")
      .single();

    if (!currencyData) {
      throw new Error("USD currency not found");
    }

    // Load transactions
    const transactionsToInsert = sampleTransactions.map(t => ({
      user_id: user.id,
      account_id: accountId,
      description: t.description,
      amount: t.amount,
      transaction_type: t.transaction_type,
      category: t.category,
      date: t.date,
      currency_id: currencyData.id,
    }));

    const { error: transactionsError } = await supabase
      .from("transactions")
      .insert(transactionsToInsert);

    if (transactionsError && transactionsError.code !== '23505') { // Ignore duplicate errors
      console.error("Transactions error:", transactionsError);
    }

    // Load investments

    const investmentsToInsert = sampleInvestments.map(i => ({
      user_id: user.id,
      symbol: i.symbol,
      quantity: i.quantity,
      purchase_price: i.purchase_price,
      purchase_date: i.purchase_date,
      asset_type: i.asset_type,
      currency_id: currencyData?.id,
    }));

    const { error: investmentsError } = await supabase
      .from("investment_portfolio")
      .insert(investmentsToInsert);

    if (investmentsError && investmentsError.code !== '23505') {
      console.error("Investments error:", investmentsError);
    }

    // Load financial goals
    const goalsToInsert = sampleGoals.map(g => ({
      user_id: user.id,
      ...g,
      currency_id: currencyData?.id,
    }));

    const { error: goalsError } = await supabase
      .from("financial_goals")
      .insert(goalsToInsert);

    if (goalsError && goalsError.code !== '23505') {
      console.error("Goals error:", goalsError);
    }

    return { success: true, message: "Sample data loaded successfully" };
  } catch (error) {
    console.error("Error loading sample data:", error);
    throw error;
  }
};

export const clearSampleData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Delete transactions
    await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id)
      .in("description", sampleTransactions.map(t => t.description));

    // Delete investments
    await supabase
      .from("investment_portfolio")
      .delete()
      .eq("user_id", user.id)
      .in("symbol", sampleInvestments.map(i => i.symbol));

    // Delete goals
    await supabase
      .from("financial_goals")
      .delete()
      .eq("user_id", user.id)
      .in("goal_name", sampleGoals.map(g => g.goal_name));

    return { success: true, message: "Sample data cleared successfully" };
  } catch (error) {
    console.error("Error clearing sample data:", error);
    throw error;
  }
};
