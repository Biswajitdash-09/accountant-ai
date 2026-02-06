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

export type DemoActivationStep = 
  | 'idle' 
  | 'starting'
  | 'fetching_currencies'
  | 'creating_bank_connections' 
  | 'creating_accounts' 
  | 'generating_transactions' 
  | 'complete'
  | 'error';

interface DemoModeContextType {
  isDemoMode: boolean;
  isLoading: boolean;
  currentStep: DemoActivationStep;
  stepProgress: string;
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
  const [currentStep, setCurrentStep] = useState<DemoActivationStep>('idle');
  const [stepProgress, setStepProgress] = useState('');
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
        .contains('metadata', { is_demo: true });

      if (connections) {
        const demoConns = connections.map(conn => ({
          ...conn,
          metadata: conn.metadata as DemoBankConnection['metadata'],
        })) as DemoBankConnection[];
        setDemoBankConnections(demoConns);
      }

      // Get demo accounts count (by [DEMO] prefix)
      const { data: accounts, count: accountCount } = await supabase
        .from('accounts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .like('account_name', '[DEMO]%');

      // Get demo transactions count (by data_source_metadata)
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .contains('data_source_metadata', { is_demo: true });

      // Calculate total balance from accounts
      const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

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
    setCurrentStep('starting');
    setStepProgress('Initializing demo mode...');
    const sessionId = generateDemoSessionId();

    try {
      // Step 1: Fetch currencies
      setCurrentStep('fetching_currencies');
      setStepProgress('Fetching currency data...');
      
      const { data: currencies, error: currError } = await supabase
        .from('currencies')
        .select('id, code')
        .in('code', ['USD', 'GBP', 'NGN', 'INR']);

      if (currError) {
        console.error('[Demo Mode] Currency fetch error:', currError);
        throw new Error('Failed to fetch currencies: ' + currError.message);
      }

      // Create currency map with fallback
      const currencyMap = new Map<string, string>();
      currencies?.forEach(c => currencyMap.set(c.code, c.id));
      
      // Use USD as fallback if available
      const fallbackCurrencyId = currencyMap.get('USD') || currencies?.[0]?.id;
      
      if (!fallbackCurrencyId) {
        console.error('[Demo Mode] No currencies found in database');
        throw new Error('No currencies configured. Please add currencies first.');
      }
      
      console.log('[Demo Mode] Currency map:', Object.fromEntries(currencyMap));

      // Step 2: Create bank connections
      setCurrentStep('creating_bank_connections');
      setStepProgress('Creating bank connections...');
      
      const bankConnections = generateDemoBankConnections(user.id, sessionId);

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

      if (connError) {
        console.error('[Demo Mode] Bank connections error:', connError);
        throw new Error('Failed to create bank connections: ' + connError.message);
      }
      
      console.log('[Demo Mode] Bank connections created:', bankConnections.length);

      // Step 3: Create accounts (no metadata column - use [DEMO] prefix)
      setCurrentStep('creating_accounts');
      setStepProgress('Creating demo accounts...');
      
      const accounts = generateDemoAccounts(sessionId);
      
      // Map accounts with correct currency IDs
      const accountsToInsert = accounts.map(acc => ({
        user_id: user.id,
        account_name: acc.account_name,
        account_type: acc.account_type,
        balance: acc.balance,
        currency_id: currencyMap.get(acc.currency_code) || fallbackCurrencyId,
      }));

      console.log('[Demo Mode] Inserting accounts:', accountsToInsert);

      const { data: insertedAccounts, error: accError } = await supabase
        .from('accounts')
        .insert(accountsToInsert)
        .select();

      if (accError) {
        console.error('[Demo Mode] Accounts error:', accError);
        // Cleanup bank connections on failure
        await supabase
          .from('bank_connections')
          .delete()
          .eq('user_id', user.id)
          .contains('metadata', { is_demo: true });
        throw new Error('Failed to create accounts: ' + accError.message);
      }
      
      console.log('[Demo Mode] Accounts created:', insertedAccounts?.length);

      // Step 4: Generate transactions (use data_source_metadata)
      setCurrentStep('generating_transactions');
      setStepProgress('Generating realistic transactions...');

      if (insertedAccounts && insertedAccounts.length > 0) {
        const allTransactions: any[] = [];

        for (const account of insertedAccounts) {
          const txCount = 20 + Math.floor(Math.random() * 10); // 20-30 per account
          const transactions = generateDemoTransactions(account.id, sessionId, txCount);
          
          transactions.forEach(tx => {
            allTransactions.push({
              user_id: user.id,
              account_id: tx.account_id,
              amount: tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
              category: tx.category,
              currency_id: account.currency_id || fallbackCurrencyId,
              date: tx.date,
              description: tx.description,
              type: tx.type,
              data_source_metadata: tx.data_source_metadata,
            });
          });
        }

        console.log('[Demo Mode] Inserting transactions:', allTransactions.length);

        const { error: txError } = await supabase
          .from('transactions')
          .insert(allTransactions);

        if (txError) {
          console.error('[Demo Mode] Transactions error:', txError);
          // Cleanup on failure
          await supabase
            .from('accounts')
            .delete()
            .eq('user_id', user.id)
            .like('account_name', '[DEMO]%');
          await supabase
            .from('bank_connections')
            .delete()
            .eq('user_id', user.id)
            .contains('metadata', { is_demo: true });
          throw new Error('Failed to create transactions: ' + txError.message);
        }
        
        console.log('[Demo Mode] Transactions created successfully');
      }

      // Success!
      setCurrentStep('complete');
      setStepProgress('Demo mode activated!');
      
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
    } catch (error: any) {
      console.error('[Demo Mode] Activation failed:', error);
      setCurrentStep('error');
      setStepProgress(error.message || 'An error occurred');
      toast.error('Failed to activate demo mode', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
      // Reset step after delay
      setTimeout(() => {
        setCurrentStep('idle');
      }, 2000);
    }
  }, [user]);

  const deactivateDemoMode = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setCurrentStep('starting');
    setStepProgress('Cleaning up demo data...');

    try {
      console.log('[Demo Mode] Starting cleanup for user:', user.id);

      // Delete demo transactions (by data_source_metadata)
      setStepProgress('Removing demo transactions...');
      const { error: txDeleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .contains('data_source_metadata', { is_demo: true });

      if (txDeleteError) {
        console.error('[Demo Mode] Transaction deletion error:', txDeleteError);
      }

      // Delete demo accounts (by [DEMO] prefix in name)
      setStepProgress('Removing demo accounts...');
      const { error: accDeleteError } = await supabase
        .from('accounts')
        .delete()
        .eq('user_id', user.id)
        .like('account_name', '[DEMO]%');

      if (accDeleteError) {
        console.error('[Demo Mode] Account deletion error:', accDeleteError);
      }

      // Delete demo bank connections (by metadata)
      setStepProgress('Removing demo bank connections...');
      const { error: bankDeleteError } = await supabase
        .from('bank_connections')
        .delete()
        .eq('user_id', user.id)
        .contains('metadata', { is_demo: true });

      if (bankDeleteError) {
        console.error('[Demo Mode] Bank connection deletion error:', bankDeleteError);
      }

      console.log('[Demo Mode] Cleanup complete');

      // Clear state
      localStorage.removeItem(DEMO_MODE_KEY);
      localStorage.removeItem(DEMO_SESSION_KEY);
      setIsDemoMode(false);
      setDemoSessionId(null);
      setDemoBankConnections([]);
      setDemoStats({ accountCount: 0, transactionCount: 0, totalBalance: 0 });
      setCurrentStep('idle');

      toast.success('Demo Mode Deactivated', {
        description: 'All demo data has been cleaned up.',
      });
    } catch (error: any) {
      console.error('[Demo Mode] Deactivation failed:', error);
      setCurrentStep('error');
      toast.error('Failed to clean up demo data', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const resetDemoData = useCallback(async () => {
    await deactivateDemoMode();
    await new Promise(resolve => setTimeout(resolve, 500));
    await activateDemoMode();
  }, [deactivateDemoMode, activateDemoMode]);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        isLoading,
        currentStep,
        stepProgress,
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
