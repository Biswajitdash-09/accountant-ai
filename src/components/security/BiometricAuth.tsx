import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Fingerprint, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Loader2, 
  Shield,
  ScanFace,
  Monitor,
  Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBiometric } from '@/contexts/BiometricContext';
import { useAuth } from '@/contexts/AuthContext';

export const BiometricAuth = () => {
  const { 
    isAvailable, 
    isEnabled, 
    enable, 
    disable, 
    lock, 
    isVerifying, 
    unlock,
    platform,
    capabilities,
    diagnosis
  } = useBiometric();
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
          title: `${capabilities.biometricLabel} Enabled`,
          description: `Your ${capabilities.biometricLabel.toLowerCase()} is now set up for secure sign-in.`,
        });
      }
    } catch (error: any) {
      console.error('Biometric registration error:', error);
      
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register biometric authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableBiometric = () => {
    disable();
    toast({
      title: `${capabilities.biometricLabel} Disabled`,
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
          description: `${capabilities.biometricLabel} verification completed successfully.`,
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
      description: `The app has been locked. Use ${capabilities.biometricLabel.toLowerCase()} to unlock.`,
    });
  };

  // Render appropriate icon based on device type
  const BiometricIcon = () => {
    if (capabilities.biometricIcon === 'face') {
      return <ScanFace className="h-5 w-5 text-primary" />;
    }
    if (capabilities.biometricIcon === 'both') {
      return (
        <div className="flex items-center gap-1">
          <Fingerprint className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">/</span>
          <ScanFace className="h-4 w-4 text-primary" />
        </div>
      );
    }
    return <Fingerprint className="h-5 w-5 text-primary" />;
  };

  // Get device-specific description
  const getDeviceDescription = () => {
    if (platform.isMobile) {
      return 'Use fingerprint or face recognition to secure your app';
    }
    if (platform.os === 'Windows') {
      return 'Use Windows Hello face recognition to secure your app';
    }
    if (platform.os === 'macOS') {
      return 'Use Touch ID to secure your app';
    }
    return 'Use facial recognition to secure your app';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {capabilities.biometricIcon === 'face' ? (
              <ScanFace className="h-5 w-5 text-primary" />
            ) : capabilities.biometricIcon === 'both' ? (
              <Fingerprint className="h-5 w-5 text-primary" />
            ) : (
              <Fingerprint className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{capabilities.biometricLabel}</CardTitle>
            <CardDescription>
              {getDeviceDescription()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAvailable ? (
          <>
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {diagnosis?.errorMessage || 
                  'Biometric authentication is not available on this device.'}
              </AlertDescription>
            </Alert>
            
            {/* Setup instructions based on platform */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">How to enable biometrics</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {capabilities.setupInstructions}
              </p>
              
              {/* Platform-specific icons */}
              <div className="flex items-center gap-2 pt-2">
                {platform.isMobile ? (
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">
                  {platform.os} • {platform.browser}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Device type indicator */}
            <Alert className="border-primary/30 bg-primary/5">
              {platform.isMobile ? (
                <Smartphone className="h-4 w-4 text-primary" />
              ) : (
                <Monitor className="h-4 w-4 text-primary" />
              )}
              <AlertDescription className="text-sm">
                {platform.isMobile ? (
                  <>
                    <span className="font-medium">Mobile device detected.</span>{' '}
                    {platform.os === 'iOS' 
                      ? 'Touch ID and Face ID are available.'
                      : 'Fingerprint and face unlock are available.'
                    }
                  </>
                ) : (
                  <>
                    <span className="font-medium">{platform.os} detected.</span>{' '}
                    {platform.os === 'Windows' 
                      ? 'Windows Hello face recognition is available.'
                      : platform.os === 'macOS'
                        ? 'Touch ID is available.'
                        : 'Facial recognition is available.'
                    }
                  </>
                )}
              </AlertDescription>
            </Alert>

            {isEnabled && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600 dark:text-green-400">
                  {capabilities.biometricLabel} is active. Your app will require verification after 5 minutes of inactivity.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label htmlFor="biometric-toggle" className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Enable {capabilities.biometricLabel}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Require {capabilities.biometricLabel.toLowerCase()} to access your account
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
                    <BiometricIcon />
                  )}
                  <span className="ml-2">Test {capabilities.biometricLabel}</span>
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
              {platform.isMobile ? (
                <p>• Compatible with {platform.os === 'iOS' ? 'Touch ID and Face ID' : 'fingerprint and face unlock'}</p>
              ) : (
                <p>• Compatible with {platform.os === 'Windows' ? 'Windows Hello' : platform.os === 'macOS' ? 'Touch ID' : 'facial recognition'}</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
