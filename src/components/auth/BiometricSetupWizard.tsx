import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint, Shield, CheckCircle, Smartphone, ArrowRight, ScanFace, Monitor } from 'lucide-react';
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
  const { isAvailable, enable, isEnabled, platform, capabilities } = useBiometric();
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
          title: `${capabilities.biometricLabel} Enabled! 🎉`,
          description: `You can now use ${capabilities.biometricLabel.toLowerCase()} to sign in.`,
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
        description: error.message || `Could not enable ${capabilities.biometricLabel}. Please ensure your device supports biometric authentication.`,
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

  // Get the appropriate icon based on device
  const BiometricIcon = ({ size = 12, className = "" }: { size?: number; className?: string }) => {
    if (capabilities.biometricIcon === 'face') {
      return <ScanFace className={`h-${size} w-${size} ${className}`} />;
    }
    return <Fingerprint className={`h-${size} w-${size} ${className}`} />;
  };

  // Get setup instruction text based on device
  const getSetupInstructionText = () => {
    if (platform.isMobile) {
      if (platform.os === 'iOS') {
        return 'Place your finger on the sensor or look at your camera when prompted.';
      }
      return 'Place your finger on the sensor or position your face when prompted.';
    }
    
    if (platform.os === 'Windows') {
      return 'Look at your camera when Windows Hello prompts you.';
    }
    
    if (platform.os === 'macOS') {
      return 'Place your finger on the Touch ID sensor when prompted.';
    }
    
    return 'Complete the biometric verification when prompted.';
  };

  // Get description text based on device
  const getDescriptionText = () => {
    if (platform.isMobile) {
      return `Skip passwords! Use your ${capabilities.biometricLabel.toLowerCase()} for instant, secure access every time you open the app.`;
    }
    
    if (platform.os === 'Windows') {
      return 'Skip passwords! Use Windows Hello face recognition for instant, secure access every time you open the app.';
    }
    
    if (platform.os === 'macOS') {
      return 'Skip passwords! Use Touch ID for instant, secure access every time you open the app.';
    }
    
    return 'Skip passwords! Use biometric authentication for instant, secure access.';
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
                  {capabilities.biometricIcon === 'face' ? (
                    <ScanFace className="h-12 w-12 text-primary" />
                  ) : capabilities.biometricIcon === 'both' ? (
                    <div className="flex items-center gap-1">
                      <Fingerprint className="h-10 w-10 text-primary" />
                      <span className="text-primary/50">/</span>
                      <ScanFace className="h-10 w-10 text-primary" />
                    </div>
                  ) : (
                    <Fingerprint className="h-12 w-12 text-primary" />
                  )}
                </div>
                <DialogTitle className="text-2xl">Enable {capabilities.biometricLabel}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {getDescriptionText()}
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
                  {platform.isMobile ? (
                    <Smartphone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Monitor className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm">Instant Access</p>
                    <p className="text-xs text-muted-foreground">
                      {platform.isMobile 
                        ? 'Sign in with a single touch or glance'
                        : platform.os === 'Windows'
                          ? 'Sign in by just looking at your camera'
                          : 'Sign in with a single touch'
                      }
                    </p>
                  </div>
                </div>

                {/* Show available biometric options for mobile */}
                {platform.isMobile && capabilities.biometricIcon === 'both' && (
                  <div className="flex items-center justify-center gap-4 py-2 border rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2 text-sm">
                      <Fingerprint className="h-4 w-4 text-primary" />
                      <span>Fingerprint</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2 text-sm">
                      <ScanFace className="h-4 w-4 text-primary" />
                      <span>Face</span>
                    </div>
                  </div>
                )}
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
                  {capabilities.biometricIcon === 'face' ? (
                    <ScanFace className="h-12 w-12 text-primary" />
                  ) : (
                    <Fingerprint className="h-12 w-12 text-primary" />
                  )}
                </div>
                <DialogTitle className="text-2xl">Register {capabilities.biometricLabel}</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {getSetupInstructionText()}
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep('intro')} disabled={isSettingUp}>
                  Back
                </Button>
                <Button onClick={handleSetup} disabled={isSettingUp} className="flex-1">
                  {isSettingUp ? (
                    <>
                      {capabilities.biometricIcon === 'face' ? (
                        <ScanFace className="mr-2 h-4 w-4 animate-pulse" />
                      ) : (
                        <Fingerprint className="mr-2 h-4 w-4 animate-pulse" />
                      )}
                      Waiting for {capabilities.biometricLabel.toLowerCase()}...
                    </>
                  ) : (
                    <>
                      {capabilities.biometricIcon === 'face' ? (
                        <ScanFace className="mr-2 h-4 w-4" />
                      ) : (
                        <Fingerprint className="mr-2 h-4 w-4" />
                      )}
                      Register {capabilities.biometricLabel}
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
                  {capabilities.biometricLabel} is now enabled. Next time you open the app, just use your {capabilities.biometricLabel.toLowerCase()}.
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
