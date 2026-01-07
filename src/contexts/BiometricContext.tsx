import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BiometricContextProps {
  isLocked: boolean;
  isAvailable: boolean;
  isEnabled: boolean;
  isVerifying: boolean;
  unlock: () => Promise<boolean>;
  enable: (userId: string, userEmail: string) => Promise<boolean>;
  disable: () => void;
  lock: () => void;
}

const BiometricContext = React.createContext<BiometricContextProps>({
  isLocked: false,
  isAvailable: false,
  isEnabled: false,
  isVerifying: false,
  unlock: async () => false,
  enable: async () => false,
  disable: () => {},
  lock: () => {},
});

export const useBiometric = () => {
  return React.useContext(BiometricContext);
};

export const BiometricProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [state, setState] = React.useState({
    isLocked: false,
    isAvailable: false,
    isEnabled: false,
    credentialId: null as string | null,
  });
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Session timeout duration (5 minutes)
  const SESSION_TIMEOUT = 5 * 60 * 1000;

  // Check biometric availability and load settings - ALWAYS lock on fresh app open
  React.useEffect(() => {
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
      
      // Check if this is a fresh page load (not just a route change)
      // We use a combination of sessionStorage and performance.navigation
      const isPageLoad = performance.navigation?.type === 1 || // page reload
                         !sessionStorage.getItem('biometric-session-active');
      
      // Lock the app when:
      // 1. Biometrics are enabled with a valid credential
      // 2. User is authenticated
      // 3. This is a fresh page load/refresh OR session has timed out
      const lastUnlock = localStorage.getItem('biometric-last-unlock');
      const sessionExpired = lastUnlock && (Date.now() - parseInt(lastUnlock) > SESSION_TIMEOUT);
      const shouldLock = enabled && credentialId && user && (isPageLoad || sessionExpired);

      console.log('Biometric check:', { available, enabled, credentialId: !!credentialId, user: !!user, isPageLoad, shouldLock });

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
  React.useEffect(() => {
    if (!state.isEnabled || !user) return;

    const updateActivity = () => {
      if (!state.isLocked) {
        localStorage.setItem('biometric-last-unlock', Date.now().toString());
      }
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => 
      window.addEventListener(event, updateActivity, { passive: true })
    );

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [state.isEnabled, state.isLocked, user]);

  // Check for lock on visibility change
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isEnabled && user) {
        const lastUnlock = localStorage.getItem('biometric-last-unlock');
        
        if (!lastUnlock || Date.now() - parseInt(lastUnlock) > SESSION_TIMEOUT) {
          setState(prev => ({ ...prev, isLocked: true }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isEnabled, user]);

  const unlock = React.useCallback(async (): Promise<boolean> => {
    if (!state.credentialId || !state.isAvailable) {
      return false;
    }

    setIsVerifying(true);

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

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
        // Mark session as active so we don't re-lock until app is closed/refreshed
        sessionStorage.setItem('biometric-session-active', 'true');
        localStorage.setItem('biometric-last-unlock', Date.now().toString());
        setState(prev => ({ ...prev, isLocked: false }));
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Biometric unlock error:', error);
      if (error.name === 'NotAllowedError') {
        return false;
      }
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, [state.credentialId, state.isAvailable]);

  const enable = React.useCallback(async (userId: string, userEmail: string): Promise<boolean> => {
    if (!state.isAvailable) {
      throw new Error('Biometric authentication not available on this device');
    }

    try {
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
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
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

  const disable = React.useCallback(() => {
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

  const lock = React.useCallback(() => {
    if (state.isEnabled) {
      localStorage.removeItem('biometric-last-unlock');
      setState(prev => ({ ...prev, isLocked: true }));
    }
  }, [state.isEnabled]);

  const contextValue = React.useMemo(() => ({
    isLocked: state.isLocked,
    isAvailable: state.isAvailable,
    isEnabled: state.isEnabled,
    isVerifying,
    unlock,
    enable,
    disable,
    lock,
  }), [state, isVerifying, unlock, enable, disable, lock]);

  return (
    <BiometricContext.Provider value={contextValue}>
      {children}
    </BiometricContext.Provider>
  );
};
