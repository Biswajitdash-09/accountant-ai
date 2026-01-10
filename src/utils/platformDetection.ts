/**
 * Platform Detection Utility
 * Detects device type, OS, and biometric capabilities
 */

export interface PlatformInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown';
  browser: string;
  supportsTouchId: boolean;
  supportsFaceId: boolean;
  supportsWindowsHello: boolean;
  isSecureContext: boolean;
}

export interface BiometricCapabilities {
  isMobile: boolean;
  hasFingerprint: boolean;
  hasFaceId: boolean;
  platformName: string;
  biometricLabel: string;
  biometricIcon: 'fingerprint' | 'face' | 'both';
  setupInstructions: string;
}

/**
 * Detects the current platform and device information
 */
export function detectPlatform(): PlatformInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';
  
  // Detect OS
  let os: PlatformInfo['os'] = 'Unknown';
  if (/iphone|ipad|ipod/.test(userAgent) || (platform.includes('mac') && 'ontouchend' in document)) {
    os = 'iOS';
  } else if (/android/.test(userAgent)) {
    os = 'Android';
  } else if (/win/.test(platform) || /windows/.test(userAgent)) {
    os = 'Windows';
  } else if (/mac/.test(platform)) {
    os = 'macOS';
  } else if (/linux/.test(platform)) {
    os = 'Linux';
  }
  
  // Detect device type
  const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|tablet|playbook|silk/i.test(userAgent) || 
    (os === 'iOS' && !isMobile) ||
    (/android/i.test(userAgent) && !/mobile/i.test(userAgent));
  const isDesktop = !isMobile && !isTablet;
  
  // Detect browser
  let browser = 'Unknown';
  if (/chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/edge|edg/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opera|opr/i.test(userAgent)) {
    browser = 'Opera';
  }
  
  // Determine biometric support based on platform
  // iOS devices with Face ID (iPhone X and later)
  const supportsFaceId = os === 'iOS' && !/iphone\s*(5|6|7|8|se)/i.test(userAgent);
  
  // Touch ID support (iPhone 8 and earlier, MacBooks with Touch Bar, some iPads)
  const supportsTouchId = os === 'iOS' || os === 'macOS';
  
  // Windows Hello (Windows 10 and later)
  const supportsWindowsHello = os === 'Windows';
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    os,
    browser,
    supportsTouchId,
    supportsFaceId,
    supportsWindowsHello,
    isSecureContext: window.isSecureContext,
  };
}

/**
 * Gets the appropriate biometric label for the current platform
 */
export function getBiometricLabel(platform: PlatformInfo): string {
  if (platform.os === 'iOS') {
    if (platform.supportsFaceId && !platform.isMobile) {
      return 'Touch ID'; // iPad with Touch ID
    }
    return platform.supportsFaceId ? 'Face ID' : 'Touch ID';
  }
  
  if (platform.os === 'Android') {
    return platform.isMobile ? 'Fingerprint / Face Unlock' : 'Biometrics';
  }
  
  if (platform.os === 'Windows') {
    return 'Windows Hello';
  }
  
  if (platform.os === 'macOS') {
    return 'Touch ID';
  }
  
  return 'Biometric Authentication';
}

/**
 * Gets the appropriate icon type for the current platform
 * - Mobile devices: 'both' (fingerprint + face)
 * - Desktop/Laptop: 'face' (facial recognition only)
 */
export function getBiometricIcon(platform: PlatformInfo): 'fingerprint' | 'face' | 'both' {
  // Mobile devices typically have both fingerprint and face options
  if (platform.isMobile) {
    return 'both';
  }
  
  // Tablets may have both
  if (platform.isTablet) {
    if (platform.os === 'iOS') {
      return platform.supportsFaceId ? 'face' : 'fingerprint';
    }
    return 'both';
  }
  
  // Desktop/Laptop: Face recognition only (Windows Hello, macOS camera)
  if (platform.isDesktop) {
    if (platform.os === 'macOS') {
      return 'fingerprint'; // MacBooks use Touch ID
    }
    return 'face'; // Windows uses Windows Hello face recognition
  }
  
  return 'fingerprint';
}

/**
 * Gets platform-specific setup instructions
 */
export function getSetupInstructions(platform: PlatformInfo): string {
  switch (platform.os) {
    case 'iOS':
      if (platform.supportsFaceId) {
        return 'Go to Settings → Face ID & Passcode → Set Up Face ID';
      }
      return 'Go to Settings → Touch ID & Passcode → Add a Fingerprint';
    
    case 'Android':
      return 'Go to Settings → Security → Fingerprint or Face Unlock';
    
    case 'Windows':
      return 'Go to Settings → Accounts → Sign-in options → Windows Hello Face';
    
    case 'macOS':
      return 'Go to System Preferences → Touch ID → Add a Fingerprint';
    
    default:
      return 'Configure biometric authentication in your device settings';
  }
}

/**
 * Gets complete biometric capabilities for the current device
 */
export function getBiometricCapabilities(): BiometricCapabilities {
  const platform = detectPlatform();
  
  return {
    isMobile: platform.isMobile || platform.isTablet,
    hasFingerprint: platform.isMobile || platform.os === 'macOS' || platform.os === 'Android',
    hasFaceId: platform.supportsFaceId || platform.supportsWindowsHello,
    platformName: platform.os,
    biometricLabel: getBiometricLabel(platform),
    biometricIcon: getBiometricIcon(platform),
    setupInstructions: getSetupInstructions(platform),
  };
}

/**
 * Checks if the current environment supports WebAuthn
 */
export async function checkWebAuthnSupport(): Promise<{
  isSupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  isSecureContext: boolean;
  errorMessage: string | null;
}> {
  const isSecureContext = window.isSecureContext;
  
  if (!isSecureContext) {
    return {
      isSupported: false,
      isPlatformAuthenticatorAvailable: false,
      isSecureContext: false,
      errorMessage: 'Biometric authentication requires a secure (HTTPS) connection. Please access this site using HTTPS.',
    };
  }
  
  if (!window.PublicKeyCredential) {
    return {
      isSupported: false,
      isPlatformAuthenticatorAvailable: false,
      isSecureContext: true,
      errorMessage: 'Your browser does not support biometric authentication. Please use a modern browser like Chrome, Safari, or Edge.',
    };
  }
  
  try {
    const isPlatformAuthenticatorAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    
    if (!isPlatformAuthenticatorAvailable) {
      const platform = detectPlatform();
      const instructions = getSetupInstructions(platform);
      
      return {
        isSupported: true,
        isPlatformAuthenticatorAvailable: false,
        isSecureContext: true,
        errorMessage: `No biometric sensor detected or biometrics not configured. ${instructions}`,
      };
    }
    
    return {
      isSupported: true,
      isPlatformAuthenticatorAvailable: true,
      isSecureContext: true,
      errorMessage: null,
    };
  } catch (error) {
    return {
      isSupported: true,
      isPlatformAuthenticatorAvailable: false,
      isSecureContext: true,
      errorMessage: 'Unable to check biometric availability. Please ensure biometrics are configured on your device.',
    };
  }
}
