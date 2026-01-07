import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Smartphone, CheckCircle2, XCircle, Lock, Loader2, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBiometric } from '@/contexts/BiometricContext';
import { useAuth } from '@/contexts/AuthContext';

export const BiometricAuth = () => {
  const { isAvailable, isEnabled, enable, disable, lock, isVerifying, unlock } = useBiometric();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleEnableBiometric = async () => {
    if (!user?.id || !user?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to enable biometric authentication.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await enable(user.id, user.email);
      
      if (success) {
        toast({
          title: "Biometric Auth Enabled",
          description: "Your fingerprint or face recognition is now set up for secure sign-in.",
        });
      }
    } catch (error: any) {
      console.error('Biometric registration error:', error);
      
      let message = "Could not register biometric authentication. Please try again.";
      if (error.name === 'NotAllowedError') {
        message = "Biometric authentication was cancelled or denied.";
      } else if (error.name === 'InvalidStateError') {
        message = "A biometric credential already exists. Please disable and re-enable.";
      }
      
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableBiometric = () => {
    disable();
    toast({
      title: "Biometric Auth Disabled",
      description: "Biometric authentication has been turned off.",
    });
  };

  const handleTestBiometric = async () => {
    setIsLoading(true);
    try {
      const success = await unlock();
      
      if (success) {
        toast({
          title: "Authentication Successful",
          description: "Biometric verification completed successfully.",
        });
      } else {
        toast({
          title: "Verification Cancelled",
          description: "Biometric verification was cancelled.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Biometric test error:', error);
      toast({
        title: "Authentication Failed",
        description: "Could not verify biometric credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockApp = () => {
    lock();
    toast({
      title: "App Locked",
      description: "The app has been locked. Use biometrics to unlock.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Fingerprint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Biometric Security</CardTitle>
            <CardDescription>
              Protect your app with fingerprint or face recognition
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAvailable ? (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Biometric authentication is not available on this device. Make sure your device has fingerprint or face recognition capabilities and that you're using a supported browser.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {!isMobile && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Biometric authentication works best on mobile devices with fingerprint or face recognition hardware.
                </AlertDescription>
              </Alert>
            )}

            {isEnabled && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  Biometric security is active. Your app will require verification after 5 minutes of inactivity or when returning to the app.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="biometric-toggle" className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Enable Biometric Lock
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require biometric verification to access your account
                </p>
              </div>
              <Switch
                id="biometric-toggle"
                checked={isEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleEnableBiometric();
                  } else {
                    handleDisableBiometric();
                  }
                }}
                disabled={isLoading || isVerifying}
              />
            </div>

            {isEnabled && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleTestBiometric}
                  disabled={isLoading || isVerifying}
                  className="flex-1"
                >
                  {isLoading || isVerifying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Fingerprint className="h-4 w-4 mr-2" />
                  )}
                  Test Biometrics
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleLockApp}
                  disabled={isLoading || isVerifying}
                  className="flex-1"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Lock App Now
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <p className="font-medium mb-2">How it works:</p>
              <p>• App locks automatically after 5 minutes of inactivity</p>
              <p>• App locks when you switch away and return</p>
              <p>• Your biometric data never leaves your device</p>
              <p>• Compatible with Touch ID, Face ID, and fingerprint sensors</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
