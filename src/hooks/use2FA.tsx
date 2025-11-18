import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorStatus {
  enabled: boolean;
  verified: boolean;
  secret?: string;
  qrCode?: string;
}

export const use2FA = () => {
  const [status, setStatus] = useState<TwoFactorStatus>({ enabled: false, verified: false });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      check2FAStatus();
    }
  }, [user]);

  const check2FAStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('two_factor_enabled, two_factor_verified')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setStatus({
          enabled: data.two_factor_enabled || false,
          verified: data.two_factor_verified || false,
        });
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const enable2FA = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enable-2fa');

      if (error) throw error;

      if (data?.secret && data?.qrCode) {
        setStatus({
          enabled: true,
          verified: false,
          secret: data.secret,
          qrCode: data.qrCode,
        });

        toast({
          title: "2FA Setup Initiated",
          description: "Scan the QR code with your authenticator app.",
        });

        return { secret: data.secret, qrCode: data.qrCode };
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { code },
      });

      if (error) throw error;

      if (data?.verified) {
        setStatus(prev => ({ ...prev, verified: true }));
        
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication is now active.",
        });

        return true;
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Verification Failed",
        description: "Could not verify the code. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async (code: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('disable-2fa', {
        body: { code },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus({ enabled: false, verified: false });
        
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been turned off.",
        });

        return true;
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-backup-codes');

      if (error) throw error;

      if (data?.codes) {
        toast({
          title: "Backup Codes Generated",
          description: "Save these codes in a secure location.",
        });

        return data.codes;
      }
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast({
        title: "Error",
        description: "Failed to generate backup codes.",
        variant: "destructive",
      });
    }
  };

  return {
    status,
    isLoading,
    enable2FA,
    verify2FA,
    disable2FA,
    generateBackupCodes,
    refresh: check2FAStatus,
  };
};
