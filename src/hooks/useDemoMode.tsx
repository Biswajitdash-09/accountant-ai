
import { useState, useEffect } from 'react';
import { seedDemoData } from '@/utils/demoData';

export const useDemoMode = () => {
  const [isDemo, setIsDemo] = useState(false);
  const [isDemoDataSeeded, setIsDemoDataSeeded] = useState(false);

  useEffect(() => {
    const checkDemoMode = () => {
      const guestMode = localStorage.getItem('isGuest') === 'true';
      setIsDemo(guestMode);
      
      if (guestMode) {
        // Check if demo data is already seeded
        const hasSeededData = localStorage.getItem('demoAccounts');
        if (!hasSeededData) {
          seedDemoData();
          setIsDemoDataSeeded(true);
        }
      }
    };

    checkDemoMode();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      checkDemoMode();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const exitDemoMode = () => {
    localStorage.removeItem('isGuest');
    localStorage.removeItem('demoAccounts');
    localStorage.removeItem('demoTransactions');
    localStorage.removeItem('demoFinancialGoals');
    localStorage.removeItem('demoRevenueStreams');
    setIsDemo(false);
    window.location.href = '/auth';
  };

  return {
    isDemo,
    isDemoDataSeeded,
    exitDemoMode
  };
};
