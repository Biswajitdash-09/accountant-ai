import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "./useTransactions";
import { useCryptoHoldings } from "./useCryptoHoldings";
import { useCryptoTransactions } from "./useCryptoTransactions";
import { useAccounts } from "./useAccounts";
import { useInvestmentTracking } from "./useInvestmentTracking";
import { normalizeTransaction } from "@/lib/transactionNormalizer";

export interface UnifiedFinancialData {
  netWorth: {
    total: number;
    breakdown: {
      traditional: number;
      crypto: number;
      investments: number;
    };
    trend: number;
  };
  cashFlow: {
    income: number;
    expenses: number;
    savings: number;
    sources: string[];
  };
  transactions: any[];
  accounts: {
    traditional: any[];
    crypto: any[];
    investment: any[];
  };
  investments: {
    stocks: any[];
    crypto: any[];
    realEstate: any[];
  };
}

export const useFinancialDataHub = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { holdings: cryptoHoldings, totalValue: cryptoValue } = useCryptoHoldings();
  const { transactions: cryptoTransactions } = useCryptoTransactions();
  const { accounts } = useAccounts();
  const { investments } = useInvestmentTracking();

  // Fetch all financial data
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data-hub', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Calculate traditional account balance
      const traditionalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

      // Calculate investment value (quantity * purchase_price)
      const investmentValue = investments.reduce((sum, inv) => sum + (inv.quantity * inv.purchase_price), 0);

      // Normalize all transactions
      const normalizedTransactions = [
        ...transactions.map(t => normalizeTransaction(t, 'traditional')),
        ...cryptoTransactions.map(t => normalizeTransaction(t, 'crypto')),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate cash flow (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentTransactions = normalizedTransactions.filter(
        t => new Date(t.date) >= thirtyDaysAgo
      );

      const income = recentTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = recentTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const netWorth = traditionalBalance + cryptoValue + investmentValue;

      const data: UnifiedFinancialData = {
        netWorth: {
          total: netWorth,
          breakdown: {
            traditional: traditionalBalance,
            crypto: cryptoValue,
            investments: investmentValue,
          },
          trend: 0, // Calculate based on historical data
        },
        cashFlow: {
          income,
          expenses,
          savings: income - expenses,
          sources: ['bank', 'crypto', 'investments'],
        },
        transactions: normalizedTransactions,
        accounts: {
          traditional: accounts,
          crypto: cryptoHoldings,
          investment: investments,
        },
        investments: {
          stocks: investments.filter(i => i.asset_type === 'stock'),
          crypto: cryptoHoldings,
          realEstate: investments.filter(i => i.asset_type === 'other'),
        },
      };

      return data;
    },
    enabled: !!user,
  });

  const getAllFinancialData = () => financialData;

  const getDataBySource = (source: 'traditional' | 'crypto' | 'investment') => {
    if (!financialData) return null;
    return {
      accounts: financialData.accounts[source],
      transactions: financialData.transactions.filter(t => t.source === source),
    };
  };

  const getDataByTimeRange = (startDate: Date, endDate: Date) => {
    if (!financialData) return [];
    return financialData.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  };

  const getTotalNetWorth = () => financialData?.netWorth.total || 0;

  const getCashFlowAnalysis = () => financialData?.cashFlow || null;

  const getInvestmentPerformance = () => {
    if (!financialData) return null;
    const { stocks, crypto, realEstate } = financialData.investments;
    
    const stocksValue = stocks.reduce((sum, s) => sum + (s.quantity * s.purchase_price), 0);
    const cryptoValueTotal = crypto.reduce((sum, c) => sum + (c.value_usd || 0), 0);
    const realEstateValue = realEstate.reduce((sum, r) => sum + (r.quantity * r.purchase_price), 0);

    return {
      stocks: { value: stocksValue, count: stocks.length },
      crypto: { value: cryptoValueTotal, count: crypto.length },
      realEstate: { value: realEstateValue, count: realEstate.length },
      total: stocksValue + cryptoValueTotal + realEstateValue,
    };
  };

  return {
    financialData,
    isLoading,
    getAllFinancialData,
    getDataBySource,
    getDataByTimeRange,
    getTotalNetWorth,
    getCashFlowAnalysis,
    getInvestmentPerformance,
  };
};
