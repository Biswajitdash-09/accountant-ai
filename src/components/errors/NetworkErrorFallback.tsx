import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkErrorFallbackProps {
  onRetry?: () => void | Promise<void>;
  error?: Error | null;
  isRetrying?: boolean;
}

export const NetworkErrorFallback = ({ 
  onRetry, 
  error, 
  isRetrying = false 
}: NetworkErrorFallbackProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetrying, setAutoRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-retry when connection is restored
      if (onRetry) {
        setAutoRetrying(true);
        const result = onRetry();
        if (result instanceof Promise) {
          result.finally(() => setAutoRetrying(false));
        } else {
          setAutoRetrying(false);
        }
      }
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onRetry]);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    if (onRetry) {
      await onRetry();
    }
  };

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
      <CardHeader className="text-center pb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isOnline 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-amber-100 dark:bg-amber-900/30'
          }`}>
            <AnimatePresence mode="wait">
              {isOnline ? (
                <motion.div
                  key="online"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="offline"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <WifiOff className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        <CardTitle className={isOnline ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}>
          {isOnline ? 'Connection Restored!' : 'Connection Lost'}
        </CardTitle>
        <CardDescription className={isOnline ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
          {isOnline 
            ? 'Your internet connection is back. Retrying...' 
            : "We can't reach our servers right now"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && process.env.NODE_ENV === 'development' && (
          <div className="bg-muted p-3 rounded-lg text-xs font-mono text-muted-foreground overflow-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying || autoRetrying}
            className="w-full"
          >
            {isRetrying || autoRetrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        </div>

        {retryCount > 0 && (
          <p className="text-xs text-center text-muted-foreground">
            Retry attempts: {retryCount}
          </p>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p className="font-medium">Troubleshooting tips:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Disable VPN or proxy if enabled</li>
            <li>Clear your browser cache</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkErrorFallback;
