import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BiometricLockState {
  isLocked: boolean;
  isAvailable: boolean;
  isEnabled: boolean;
  credentialId: string | null;
}

export const useBiometricLock = () => {
  const { user } = useAuth();
  const [state, setState] = useState<BiometricLockState>({
    isLocked: false,
    isAvailable: false,
    isEnabled: false,
    credentialId: null,
  });
  const [isVerifying, setIsVerifying] = useState(false);

  // Check biometric availability and load settings
  useEffect(() => {
    const checkAvailability = async () => {
      let available = false;
      
      if (window.PublicKeyCredential) {
        try {
          available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch (error) {
          console.error('Error checking biometric availability:', error);
        }
      }

      const enabled = localStorage.getItem('biometric-auth-enabled') === 'true';
      const credentialId = localStorage.getItem('biometric-credential-id');
      const lastUnlock = localStorage.getItem('biometric-last-unlock');
      
      // Check if user should be locked (session timeout after 5 minutes of inactivity)
      const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
      const shouldLock = enabled && credentialId && user && (
        !lastUnlock || 
        Date.now() - parseInt(lastUnlock) > SESSION_TIMEOUT
      );

      setState({
        isAvailable: available,
        isEnabled: enabled,
        credentialId,
        isLocked: shouldLock || false,
      });
    };

    checkAvailability();
  }, [user]);

  // Track user activity to manage session
  useEffect(() => {
    if (!state.isEnabled || !user) return;

    const updateActivity = () => {
      if (!state.isLocked) {
        localStorage.setItem('biometric-last-unlock', Date.now().toString());
      }
    };

    // Update activity on user interactions
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, updateActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [state.isEnabled, state.isLocked, user]);

  // Check for lock on visibility change (when app comes to foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isEnabled && user) {
        const lastUnlock = localStorage.getItem('biometric-last-unlock');
        const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
        
        if (!lastUnlock || Date.now() - parseInt(lastUnlock) > SESSION_TIMEOUT) {
          setState(prev => ({ ...prev, isLocked: true }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isEnabled, user]);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (!state.credentialId || !state.isAvailable) {
      return false;
    }

    setIsVerifying(true);

    try {
      // Generate a secure challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Convert stored credential ID back to Uint8Array
      const credentialIdArray = Uint8Array.from(
        atob(state.credentialId), 
        c => c.charCodeAt(0)
      );

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: credentialIdArray,
            type: 'public-key',
            transports: ['internal'],
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (credential) {
        // Mark as unlocked
        localStorage.setItem('biometric-last-unlock', Date.now().toString());
        setState(prev => ({ ...prev, isLocked: false }));
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Biometric unlock error:', error);
      
      // If user cancels, don't throw error
      if (error.name === 'NotAllowedError') {
        return false;
      }
      
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, [state.credentialId, state.isAvailable]);

  const enable = useCallback(async (userId: string, userEmail: string): Promise<boolean> => {
    if (!state.isAvailable) {
      throw new Error('Biometric authentication not available on this device');
    }

    try {
      // Generate secure values
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      const userIdArray = new TextEncoder().encode(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Accountant AI',
            id: window.location.hostname,
          },
          user: {
            id: userIdArray,
            name: userEmail,
            displayName: userEmail.split('@')[0],
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      }) as PublicKeyCredential | null;

      if (credential) {
        // Store credential ID as base64
        const credentialId = btoa(
          String.fromCharCode(...new Uint8Array(credential.rawId))
        );
        
        localStorage.setItem('biometric-auth-enabled', 'true');
        localStorage.setItem('biometric-credential-id', credentialId);
        localStorage.setItem('biometric-last-unlock', Date.now().toString());
        
        setState(prev => ({
          ...prev,
          isEnabled: true,
          credentialId,
          isLocked: false,
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Biometric enable error:', error);
      throw error;
    }
  }, [state.isAvailable]);

  const disable = useCallback(() => {
    localStorage.removeItem('biometric-auth-enabled');
    localStorage.removeItem('biometric-credential-id');
    localStorage.removeItem('biometric-last-unlock');
    
    setState(prev => ({
      ...prev,
      isEnabled: false,
      credentialId: null,
      isLocked: false,
    }));
  }, []);

  const lock = useCallback(() => {
    if (state.isEnabled) {
      localStorage.removeItem('biometric-last-unlock');
      setState(prev => ({ ...prev, isLocked: true }));
    }
  }, [state.isEnabled]);

  return {
    isLocked: state.isLocked,
    isAvailable: state.isAvailable,
    isEnabled: state.isEnabled,
    isVerifying,
    unlock,
    enable,
    disable,
    lock,
  };
};
