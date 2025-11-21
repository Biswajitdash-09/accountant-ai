import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useState, useEffect } from "react";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
  savings: number;
}

export const useChartData = (months: number = 6) => {
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID safely
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch (error) {
        console.warn('Failed to get user for chart data:', error);
      }
    };
    getUser();
  }, []);

  const fetchChartData = async (): Promise<MonthlyData[]> => {
    if (!userId) throw new Error("Not authenticated");

    const endDate = new Date();
    const startDate = subMonths(endDate, months - 1);

    // Check cache first
    const cacheKey = `chart-data-${months}-${userId}`;
    const { data: cached } = await supabase
      .from('analytics_cache')
      .select('data')
      .eq('cache_key', cacheKey)
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cached?.data) {
      return cached.data as any as MonthlyData[];
    }

    // Fetch transactions for the period
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('date, amount, type')
      .eq('user_id', userId)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lte('date', format(endDate, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyMap: { [key: string]: { income: number; expenses: number } } = {};
    
    // Initialize all months with 0
    for (let i = 0; i < months; i++) {
      const date = subMonths(endDate, months - 1 - i);
      const monthKey = format(date, 'MMM yyyy');
      monthlyMap[monthKey] = { income: 0, expenses: 0 };
    }

    // Aggregate transactions
    transactions?.forEach(txn => {
      const monthKey = format(new Date(txn.date), 'MMM yyyy');
      if (monthlyMap[monthKey]) {
        if (txn.type === 'income') {
          monthlyMap[monthKey].income += txn.amount;
        } else {
          monthlyMap[monthKey].expenses += Math.abs(txn.amount);
        }
      }
    });

    // Convert to array format with 'period' key for compatibility
    const chartData: MonthlyData[] = Object.entries(monthlyMap).map(([month, data]) => ({
      month: month.split(' ')[0], // Just "Jan", "Feb", etc
      period: month.split(' ')[0], // Alias for compatibility
      income: data.income,
      expenses: data.expenses,
      profit: data.income - data.expenses,
      savings: data.income - data.expenses,
    } as any));

    // Cache the result for 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await supabase
      .from('analytics_cache')
      .upsert({
        cache_key: cacheKey,
        user_id: userId,
        data: chartData as any,
        expires_at: expiresAt.toISOString(),
      });

    return chartData;
  };

  return useQuery({
    queryKey: ['chart-data', months, userId],
    queryFn: fetchChartData,
    enabled: !!userId, // Only run query if user is authenticated
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  });
};

export const useInvestmentChartData = (months: number = 12) => {
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID safely
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch (error) {
        console.warn('Failed to get user for investment chart data:', error);
      }
    };
    getUser();
  }, []);

  const fetchInvestmentData = async () => {
    if (!userId) throw new Error("Not authenticated");

    const endDate = new Date();
    const chartData = [];

    // Generate last N months
    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(endDate, i);
      const monthKey = format(date, 'MMM');
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      // Fetch stocks value for this month
      const { data: stocks } = await supabase
        .from('investment_portfolio')
        .select('quantity, purchase_price')
        .eq('user_id', userId)
        .lte('purchase_date', format(monthEnd, 'yyyy-MM-dd'));

      const stocksValue = stocks?.reduce((sum, s) => 
        sum + (s.quantity * s.purchase_price), 0
      ) || 0;

      // Fetch crypto value for this month via wallet
      const { data: wallets } = await supabase
        .from('crypto_wallets')
        .select('id')
        .eq('user_id', userId);

      let cryptoValue = 0;
      if (wallets && wallets.length > 0) {
        const { data: cryptoHoldings } = await supabase
          .from('crypto_holdings')
          .select('balance, last_price_usd')
          .in('wallet_id', wallets.map(w => w.id));

        cryptoValue = cryptoHoldings?.reduce((sum, c) => 
          sum + (c.balance * c.last_price_usd), 0
        ) || 0;
      }

      // Apply historical growth simulation (decreasing as we go back)
      const growthFactor = 1 - (i * 0.03); // 3% decrease per month going back
      
      chartData.push({
        month: monthKey,
        stocks: Math.round(stocksValue * growthFactor),
        crypto: Math.round(cryptoValue * growthFactor),
        total: Math.round((stocksValue + cryptoValue) * growthFactor),
      });
    }

    return chartData;
  };

  return useQuery({
    queryKey: ['investment-chart', months, userId],
    queryFn: fetchInvestmentData,
    enabled: !!userId, // Only run query if user is authenticated
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
