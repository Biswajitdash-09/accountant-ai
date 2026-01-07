import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint, Shield, CheckCircle, Smartphone, ArrowRight, X } from 'lucide-react';
import { useBiometric } from '@/contexts/BiometricContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BiometricSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BiometricSetupWizard = ({ isOpen, onClose, onComplete }: BiometricSetupWizardProps) => {
  const { isAvailable, enable, isEnabled } = useBiometric();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'intro' | 'setup' | 'success'>('intro');
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleSetup = async () => {
    if (!user?.id || !user?.email) {
      toast({
        title: "User information required",
        description: "Please ensure you're logged in to enable biometrics.",
        variant: "destructive",
      });
      return;
    }

    setIsSettingUp(true);
    try {
      const success = await enable(user.id, user.email);
      if (success) {
        setStep('success');
        localStorage.setItem('biometric-setup-shown', 'true');
        toast({
          title: "Biometric Sign-in Enabled! 🎉",
          description: "You can now use fingerprint or Face ID to sign in.",
        });
      } else {
        toast({
          title: "Setup Incomplete",
          description: "Biometric registration was not completed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Biometric setup error:', error);
      toast({
        title: "Setup Failed",
        description: error.message || "Could not enable biometric authentication. Please ensure your device supports fingerprint or face recognition.",
        variant: "destructive",
      });
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('biometric-setup-shown', 'true');
    onClose();
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isAvailable) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
                  <Fingerprint className="h-12 w-12 text-primary" />
                </div>
                <DialogTitle className="text-2xl">Enable Quick Sign-in</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Use your fingerprint or Face ID for faster, more secure access to your account.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Bank-level Security</p>
                    <p className="text-xs text-muted-foreground">Your biometric data stays on your device</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Smartphone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Instant Access</p>
                    <p className="text-xs text-muted-foreground">Sign in with a single touch or glance</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip for now
                </Button>
                <Button onClick={() => setStep('setup')} className="flex-1">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 animate-pulse">
                  <Fingerprint className="h-12 w-12 text-primary" />
                </div>
                <DialogTitle className="text-2xl">Register Your Device</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Place your finger on the sensor or look at your camera when prompted.
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep('intro')} disabled={isSettingUp}>
                  Back
                </Button>
                <Button onClick={handleSetup} disabled={isSettingUp} className="flex-1">
                  {isSettingUp ? (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4 animate-pulse" />
                      Waiting for biometric...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="mr-2 h-4 w-4" />
                      Register Biometric
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <DialogTitle className="text-2xl text-green-600 dark:text-green-400">
                  You're All Set!
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Biometric sign-in is now enabled. Next time you open the app, just use your fingerprint or Face ID.
                </DialogDescription>
              </DialogHeader>

              <Button onClick={handleComplete} className="w-full mt-6">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default BiometricSetupWizard;
