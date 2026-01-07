import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Shield, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface BiometricLockScreenProps {
  onUnlock: () => Promise<boolean>;
  isVerifying: boolean;
  onFallback?: () => void;
}

export const BiometricLockScreen = ({ 
  onUnlock, 
  isVerifying,
  onFallback 
}: BiometricLockScreenProps) => {
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  // Auto-trigger biometric on mount
  useEffect(() => {
    const autoTrigger = async () => {
      // Small delay to allow UI to render
      await new Promise(resolve => setTimeout(resolve, 500));
      handleUnlock();
    };
    
    autoTrigger();
  }, []);

  const handleUnlock = async () => {
    setError(null);
    
    try {
      const success = await onUnlock();
      
      if (!success) {
        setAttemptCount(prev => prev + 1);
        setError('Authentication cancelled. Please try again.');
      }
    } catch (err: any) {
      setAttemptCount(prev => prev + 1);
      
      if (err.name === 'InvalidStateError') {
        setError('Biometric not set up properly. Please reconfigure in settings.');
      } else if (err.name === 'NotSupportedError') {
        setError('Biometric authentication not supported on this device.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        
        {/* Floating security icons */}
        <motion.div
          className="absolute top-1/4 left-1/4 opacity-10"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Shield className="h-24 w-24 text-primary" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 opacity-10"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <KeyRound className="h-20 w-20 text-primary" />
        </motion.div>

        <Card className="relative max-w-md w-full shadow-2xl border-0 bg-background/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <motion.div
              className="mx-auto mb-4"
              animate={isVerifying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: isVerifying ? Infinity : 0 }}
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  {isVerifying ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  ) : (
                    <Fingerprint className="h-12 w-12 text-primary" />
                  )}
                </div>
                {/* Pulse animation ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold">App Locked</CardTitle>
            <CardDescription className="text-base">
              {user?.email ? (
                <>Welcome back, <span className="font-medium">{user.email.split('@')[0]}</span></>
              ) : (
                'Verify your identity to continue'
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Button
              onClick={handleUnlock}
              disabled={isVerifying}
              size="lg"
              className="w-full h-14 text-lg gap-3"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Fingerprint className="h-5 w-5" />
                  Unlock with Biometrics
                </>
              )}
            </Button>

            <div className="text-center space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                Use fingerprint or face recognition to access your account
              </p>
              
              {attemptCount >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign out and use password instead
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground">
                Protected by biometric security
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
