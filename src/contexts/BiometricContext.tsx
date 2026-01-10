import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  detectPlatform, 
  getBiometricCapabilities, 
  checkWebAuthnSupport,
  type PlatformInfo,
  type BiometricCapabilities
} from '@/utils/platformDetection';

interface BiometricDiagnosis {
  isSecureContext: boolean;
  webAuthnSupported: boolean;
  platformAuthenticatorAvailable: boolean;
  platform: PlatformInfo;
  capabilities: BiometricCapabilities;
  errorMessage: string | null;
}

interface BiometricContextProps {
  isLocked: boolean;
  isAvailable: boolean;
  isEnabled: boolean;
  isVerifying: boolean;
  // Device-specific capabilities
  platform: PlatformInfo;
  capabilities: BiometricCapabilities;
  // Diagnostic info
  diagnosis: BiometricDiagnosis | null;
  // Actions
  unlock: () => Promise<boolean>;
  enable: (userId: string, userEmail: string) => Promise<boolean>;
  disable: () => void;
  lock: () => void;
  diagnose: () => Promise<BiometricDiagnosis>;
}

const defaultPlatform: PlatformInfo = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  os: 'Unknown',
  browser: 'Unknown',
  supportsTouchId: false,
  supportsFaceId: false,
  supportsWindowsHello: false,
  isSecureContext: false,
};

const defaultCapabilities: BiometricCapabilities = {
  isMobile: false,
  hasFingerprint: false,
  hasFaceId: false,
  platformName: 'Unknown',
  biometricLabel: 'Biometric Authentication',
  biometricIcon: 'fingerprint',
  setupInstructions: 'Configure biometric authentication in your device settings',
};

const BiometricContext = React.createContext<BiometricContextProps>({
  isLocked: false,
  isAvailable: false,
  isEnabled: false,
  isVerifying: false,
  platform: defaultPlatform,
  capabilities: defaultCapabilities,
  diagnosis: null,
  unlock: async () => false,
  enable: async () => false,
  disable: () => {},
  lock: () => {},
  diagnose: async () => ({
    isSecureContext: false,
    webAuthnSupported: false,
    platformAuthenticatorAvailable: false,
    platform: defaultPlatform,
    capabilities: defaultCapabilities,
    errorMessage: null,
  }),
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
  const [platform, setPlatform] = React.useState<PlatformInfo>(defaultPlatform);
  const [capabilities, setCapabilities] = React.useState<BiometricCapabilities>(defaultCapabilities);
  const [diagnosis, setDiagnosis] = React.useState<BiometricDiagnosis | null>(null);

  // Session timeout duration (5 minutes)
  const SESSION_TIMEOUT = 5 * 60 * 1000;

  // Check biometric availability and load settings
  React.useEffect(() => {
    const checkAvailability = async () => {
      // Detect platform and capabilities
      const detectedPlatform = detectPlatform();
      const detectedCapabilities = getBiometricCapabilities();
      
      setPlatform(detectedPlatform);
      setCapabilities(detectedCapabilities);
      
      let available = false;
      
      // Check WebAuthn support
      const webAuthnCheck = await checkWebAuthnSupport();
      
      if (webAuthnCheck.isSupported && webAuthnCheck.isPlatformAuthenticatorAvailable) {
        available = true;
      }

      const enabled = localStorage.getItem('biometric-auth-enabled') === 'true';
      const credentialId = localStorage.getItem('biometric-credential-id');
      
      // Check if this is a fresh page load
      const isPageLoad = performance.navigation?.type === 1 || 
                         !sessionStorage.getItem('biometric-session-active');
      
      // Lock the app when appropriate
      const lastUnlock = localStorage.getItem('biometric-last-unlock');
      const sessionExpired = lastUnlock && (Date.now() - parseInt(lastUnlock) > SESSION_TIMEOUT);
      const shouldLock = enabled && credentialId && user && (isPageLoad || sessionExpired);

      console.log('Biometric check:', { 
        available, 
        enabled, 
        credentialId: !!credentialId, 
        user: !!user, 
        isPageLoad, 
        shouldLock,
        platform: detectedPlatform.os,
        isMobile: detectedPlatform.isMobile
      });

      setState({
        isAvailable: available,
        isEnabled: enabled,
        credentialId,
        isLocked: shouldLock || false,
      });
      
      // Store initial diagnosis
      setDiagnosis({
        isSecureContext: webAuthnCheck.isSecureContext,
        webAuthnSupported: webAuthnCheck.isSupported,
        platformAuthenticatorAvailable: webAuthnCheck.isPlatformAuthenticatorAvailable,
        platform: detectedPlatform,
        capabilities: detectedCapabilities,
        errorMessage: webAuthnCheck.errorMessage,
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

  const diagnose = React.useCallback(async (): Promise<BiometricDiagnosis> => {
    const detectedPlatform = detectPlatform();
    const detectedCapabilities = getBiometricCapabilities();
    const webAuthnCheck = await checkWebAuthnSupport();
    
    const result: BiometricDiagnosis = {
      isSecureContext: webAuthnCheck.isSecureContext,
      webAuthnSupported: webAuthnCheck.isSupported,
      platformAuthenticatorAvailable: webAuthnCheck.isPlatformAuthenticatorAvailable,
      platform: detectedPlatform,
      capabilities: detectedCapabilities,
      errorMessage: webAuthnCheck.errorMessage,
    };
    
    setDiagnosis(result);
    return result;
  }, []);

  const unlock = React.useCallback(async (): Promise<boolean> => {
    if (!state.credentialId || !state.isAvailable) {
      console.log('Unlock failed: no credential or not available', { 
        hasCredential: !!state.credentialId, 
        isAvailable: state.isAvailable 
      });
      return false;
    }

    setIsVerifying(true);

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      let credentialIdArray: Uint8Array;
      try {
        credentialIdArray = Uint8Array.from(
          atob(state.credentialId), 
          c => c.charCodeAt(0)
        );
      } catch (e) {
        console.error('Failed to decode credential ID:', e);
        localStorage.removeItem('biometric-credential-id');
        localStorage.removeItem('biometric-auth-enabled');
        setState(prev => ({ ...prev, isEnabled: false, credentialId: null, isLocked: false }));
        return false;
      }

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: credentialIdArray.buffer as ArrayBuffer,
            type: 'public-key',
            transports: ['internal'],
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (credential) {
        sessionStorage.setItem('biometric-session-active', 'true');
        localStorage.setItem('biometric-last-unlock', Date.now().toString());
        setState(prev => ({ ...prev, isLocked: false }));
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Biometric unlock error:', error);
      
      if (error.name === 'NotAllowedError') {
        console.log('Biometric authentication was cancelled or denied');
        return false;
      }
      
      if (error.name === 'InvalidStateError') {
        console.log('Credential is invalid, clearing...');
        localStorage.removeItem('biometric-credential-id');
        localStorage.removeItem('biometric-auth-enabled');
        setState(prev => ({ ...prev, isEnabled: false, credentialId: null, isLocked: false }));
        return false;
      }
      
      if (error.name === 'SecurityError') {
        console.error('Security error during biometric auth');
        return false;
      }
      
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, [state.credentialId, state.isAvailable]);

  const enable = React.useCallback(async (userId: string, userEmail: string): Promise<boolean> => {
    if (!state.isAvailable) {
      const errorMsg = diagnosis?.errorMessage || 
        `Biometric authentication is not available on this device. ${capabilities.setupInstructions}`;
      throw new Error(errorMsg);
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
        sessionStorage.setItem('biometric-session-active', 'true');
        
        setState(prev => ({
          ...prev,
          isEnabled: true,
          credentialId,
          isLocked: false,
        }));
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Biometric enable error:', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error(`${capabilities.biometricLabel} registration was cancelled. Please try again and complete the verification when prompted.`);
      }
      
      if (error.name === 'InvalidStateError') {
        throw new Error('A biometric credential already exists for this device. Try disabling and re-enabling biometrics.');
      }
      
      if (error.name === 'NotSupportedError') {
        throw new Error('Your browser does not support biometric authentication. Please try using Chrome, Safari, or Edge.');
      }
      
      if (error.name === 'SecurityError') {
        throw new Error('Biometric registration failed due to a security error. Make sure you are using a secure (HTTPS) connection.');
      }
      
      throw new Error(error.message || 'Failed to enable biometric authentication. Please try again.');
    }
  }, [state.isAvailable, diagnosis, capabilities]);

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
    platform,
    capabilities,
    diagnosis,
    unlock,
    enable,
    disable,
    lock,
    diagnose,
  }), [state, isVerifying, platform, capabilities, diagnosis, unlock, enable, disable, lock, diagnose]);

  return (
    <BiometricContext.Provider value={contextValue}>
      {children}
    </BiometricContext.Provider>
  );
};
