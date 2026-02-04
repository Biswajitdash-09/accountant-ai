import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  generateDemoSessionId,
  generateDemoBankConnections,
  generateDemoAccounts,
  generateDemoTransactions,
  DemoBankConnection,
} from '@/lib/demoData';

interface DemoModeContextType {
  isDemoMode: boolean;
  isLoading: boolean;
  demoSessionId: string | null;
  demoBankConnections: DemoBankConnection[];
  demoStats: {
    accountCount: number;
    transactionCount: number;
    totalBalance: number;
  };
  activateDemoMode: () => Promise<void>;
  deactivateDemoMode: () => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const DEMO_MODE_KEY = 'accountant_ai_demo_mode';
const DEMO_SESSION_KEY = 'accountant_ai_demo_session';

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoSessionId, setDemoSessionId] = useState<string | null>(null);
  const [demoBankConnections, setDemoBankConnections] = useState<DemoBankConnection[]>([]);
  const [demoStats, setDemoStats] = useState({
    accountCount: 0,
    transactionCount: 0,
    totalBalance: 0,
  });

  // Load demo mode state from localStorage on mount
  useEffect(() => {
    const savedDemoMode = localStorage.getItem(DEMO_MODE_KEY);
    const savedSessionId = localStorage.getItem(DEMO_SESSION_KEY);
    
    if (savedDemoMode === 'true' && savedSessionId) {
      setIsDemoMode(true);
      setDemoSessionId(savedSessionId);
      // Load demo data
      loadDemoData(savedSessionId);
    }
  }, [user]);

  const loadDemoData = async (sessionId: string) => {
    if (!user) return;
    
    try {
      // Load demo bank connections
      const { data: connections } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('user_id', user.id)
        .contains('metadata', { is_demo: true, demo_session_id: sessionId });

      if (connections) {
        const demoConns = connections.map(conn => ({
          ...conn,
          metadata: conn.metadata as DemoBankConnection['metadata'],
        })) as DemoBankConnection[];
        setDemoBankConnections(demoConns);
      }

      // Get stats
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .contains('metadata', { is_demo: true });

      const { count: accountCount } = await supabase
        .from('accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Calculate total balance from connections
      const totalBalance = connections?.reduce((sum, conn) => sum + (conn.balance || 0), 0) || 0;

      setDemoStats({
        accountCount: accountCount || 0,
        transactionCount: transactionCount || 0,
        totalBalance,
      });
    } catch (error) {
      console.error('Error loading demo data:', error);
    }
  };

  const activateDemoMode = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to use demo mode');
      return;
    }

    setIsLoading(true);
    const sessionId = generateDemoSessionId();

    try {
      // Generate demo data
      const bankConnections = generateDemoBankConnections(user.id, sessionId);
      const accounts = generateDemoAccounts(user.id, sessionId);

      // Insert demo bank connections
      const { error: connError } = await supabase
        .from('bank_connections')
        .insert(
          bankConnections.map(conn => ({
            user_id: user.id,
            account_name: conn.account_name,
            account_type: conn.account_type,
            balance: conn.balance,
            currency: conn.currency,
            provider: conn.provider,
            provider_account_id: conn.provider_account_id,
            status: conn.status,
            last_sync_at: conn.last_sync_at,
            metadata: conn.metadata,
          }))
        );

      if (connError) throw connError;

      // Insert demo accounts
      const { data: insertedAccounts, error: accError } = await supabase
        .from('accounts')
        .insert(
          accounts.map(acc => ({
            user_id: user.id,
            account_name: acc.account_name,
            account_type: acc.account_type,
            balance: acc.balance,
            currency_id: acc.currency_id,
          }))
        )
        .select();

      if (accError) throw accError;

      // Generate transactions for each account
      if (insertedAccounts) {
        const allTransactions = insertedAccounts.flatMap(account => 
          generateDemoTransactions(account.id, sessionId, 20)
        );

        // Get a default currency_id (or null if none exists)
        const { data: defaultCurrency } = await supabase
          .from('currencies')
          .select('id')
          .eq('is_base', true)
          .limit(1)
          .single();

        const { error: txError } = await supabase
          .from('transactions')
          .insert(
            allTransactions.map(tx => ({
              user_id: user.id,
              account_id: tx.account_id,
              amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
              category: tx.category,
              currency_id: defaultCurrency?.id,
              date: tx.date,
              description: tx.description,
              type: tx.type,
              metadata: tx.metadata,
            }))
          );

        if (txError) throw txError;
      }

      // Save state
      localStorage.setItem(DEMO_MODE_KEY, 'true');
      localStorage.setItem(DEMO_SESSION_KEY, sessionId);
      setIsDemoMode(true);
      setDemoSessionId(sessionId);
      setDemoBankConnections(bankConnections);
      
      // Reload demo data to get accurate stats
      await loadDemoData(sessionId);

      toast.success('🎬 Demo Mode Activated', {
        description: '5 bank accounts and 100+ transactions created for your demo.',
      });
    } catch (error) {
      console.error('Error activating demo mode:', error);
      toast.error('Failed to activate demo mode');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deactivateDemoMode = useCallback(async () => {
    if (!user || !demoSessionId) return;

    setIsLoading(true);

    try {
      // Delete demo transactions (with metadata)
      await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .contains('metadata', { is_demo: true });

      // Delete demo bank connections
      await supabase
        .from('bank_connections')
        .delete()
        .eq('user_id', user.id)
        .contains('metadata', { is_demo: true });

      // Note: We don't delete accounts that don't have metadata tagging
      // In a real implementation, you'd add metadata to accounts table

      // Clear state
      localStorage.removeItem(DEMO_MODE_KEY);
      localStorage.removeItem(DEMO_SESSION_KEY);
      setIsDemoMode(false);
      setDemoSessionId(null);
      setDemoBankConnections([]);
      setDemoStats({ accountCount: 0, transactionCount: 0, totalBalance: 0 });

      toast.success('Demo Mode Deactivated', {
        description: 'All demo data has been cleaned up.',
      });
    } catch (error) {
      console.error('Error deactivating demo mode:', error);
      toast.error('Failed to clean up demo data');
    } finally {
      setIsLoading(false);
    }
  }, [user, demoSessionId]);

  const resetDemoData = useCallback(async () => {
    await deactivateDemoMode();
    await activateDemoMode();
  }, [deactivateDemoMode, activateDemoMode]);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        isLoading,
        demoSessionId,
        demoBankConnections,
        demoStats,
        activateDemoMode,
        deactivateDemoMode,
        resetDemoData,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
