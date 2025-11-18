import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Smartphone, CheckCircle2, XCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const BiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricPreference();
  }, []);

  const checkBiometricAvailability = async () => {
    // Check if Web Authentication API is available
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available);
    } else {
      setIsAvailable(false);
    }
  };

  const loadBiometricPreference = () => {
    const enabled = localStorage.getItem('biometric-auth-enabled') === 'true';
    setIsEnabled(enabled);
  };

  const registerBiometric = async () => {
    setIsLoading(true);
    try {
      // Create credential for biometric authentication
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "Accountant AI",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
          attestation: "none",
        },
      });

      if (credential) {
        localStorage.setItem('biometric-auth-enabled', 'true');
        localStorage.setItem('biometric-credential-id', (credential as any).id);
        setIsEnabled(true);
        
        toast({
          title: "Biometric Auth Enabled",
          description: "You can now use fingerprint or face recognition to sign in.",
        });
      }
    } catch (error) {
      console.error('Biometric registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Could not register biometric authentication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableBiometric = () => {
    localStorage.removeItem('biometric-auth-enabled');
    localStorage.removeItem('biometric-credential-id');
    setIsEnabled(false);
    
    toast({
      title: "Biometric Auth Disabled",
      description: "Biometric authentication has been turned off.",
    });
  };

  const testBiometric = async () => {
    setIsLoading(true);
    try {
      const credentialId = localStorage.getItem('biometric-credential-id');
      if (!credentialId) {
        throw new Error('No credential found');
      }

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          rpId: window.location.hostname,
          allowCredentials: [{
            id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
            type: 'public-key',
          }],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (credential) {
        toast({
          title: "Authentication Successful",
          description: "Biometric verification completed successfully.",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-primary" />
          <CardTitle>Biometric Authentication</CardTitle>
        </div>
        <CardDescription>
          Use fingerprint or face recognition for quick sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAvailable ? (
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Biometric authentication is not available on this device. Make sure your device has fingerprint or face recognition capabilities.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {!isMobile && (
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Biometric authentication works best on mobile devices with fingerprint or face recognition.
                </AlertDescription>
              </Alert>
            )}

            {isEnabled ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Biometric authentication is enabled for your account.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="biometric-toggle" className="font-medium">
                  Enable Biometric Sign-In
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use your device's biometric features to sign in quickly
                </p>
              </div>
              <Switch
                id="biometric-toggle"
                checked={isEnabled}
                onCheckedChange={(checked) => {
                  if (checked) {
                    registerBiometric();
                  } else {
                    disableBiometric();
                  }
                }}
                disabled={isLoading}
              />
            </div>

            {isEnabled && (
              <Button
                variant="outline"
                onClick={testBiometric}
                disabled={isLoading}
                className="w-full"
              >
                <Fingerprint className="h-4 w-4 mr-2" />
                Test Biometric Authentication
              </Button>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Your biometric data never leaves your device</p>
              <p>• Compatible with Touch ID, Face ID, and fingerprint sensors</p>
              <p>• Requires device with biometric capabilities</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
