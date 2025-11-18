import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key, Download, AlertTriangle } from 'lucide-react';
import { use2FA } from '@/hooks/use2FA';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export const TwoFactorSetup = () => {
  const { status, isLoading, enable2FA, verify2FA, disable2FA, generateBackupCodes } = use2FA();
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleEnable = async () => {
    const result = await enable2FA();
    if (result) {
      setQrCode(result.qrCode);
      setSecret(result.secret);
    }
  };

  const handleVerify = async () => {
    const success = await verify2FA(verificationCode);
    if (success) {
      setVerificationCode('');
      setQrCode(null);
      setSecret(null);
      const codes = await generateBackupCodes();
      if (codes) {
        setBackupCodes(codes);
      }
    }
  };

  const handleDisable = async () => {
    const success = await disable2FA(disableCode);
    if (success) {
      setDisableCode('');
      setBackupCodes([]);
    }
  };

  const downloadBackupCodes = () => {
    const content = `Accountant AI - 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nIMPORTANT: Store these codes in a secure location.\nEach code can only be used once.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accountant-ai-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!status.enabled || !status.verified) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status.enabled ? (
            <>
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Two-factor authentication (2FA) adds an extra layer of security by requiring a code from your phone in addition to your password.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>An authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Your smartphone</li>
                  <li>A secure place to store backup codes</li>
                </ul>
              </div>

              <Button onClick={handleEnable} disabled={isLoading} className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </>
          ) : (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Complete setup by scanning the QR code with your authenticator app.
                </AlertDescription>
              </Alert>

              {qrCode && (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>

                  {secret && (
                    <div className="space-y-2">
                      <Label>Manual Entry Key</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                          {secret}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(secret);
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Verification Code</Label>
                    <Input
                      id="verification-code"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>

                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full"
                  >
                    Verify & Enable 2FA
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-500/10 text-green-500">
            Enabled
          </Badge>
        </div>
        <CardDescription>
          Your account is protected with two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {backupCodes.length > 0 && (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Save Your Backup Codes</p>
                <p className="text-sm">
                  These codes can be used to access your account if you lose access to your authenticator app. Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="p-2 bg-muted rounded text-sm text-center">
                      {code}
                    </code>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="w-full mt-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup Codes
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="disable-code">Enter Code to Disable</Label>
          <Input
            id="disable-code"
            type="text"
            placeholder="Enter 6-digit code"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value)}
            maxLength={6}
          />
        </div>

        <Button
          variant="destructive"
          onClick={handleDisable}
          disabled={isLoading || disableCode.length !== 6}
          className="w-full"
        >
          Disable Two-Factor Authentication
        </Button>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Disabling 2FA will make your account less secure. Only disable if absolutely necessary.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
