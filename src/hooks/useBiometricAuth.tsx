import { useState, useEffect, useCallback } from "react";

interface BiometricAuthOptions {
  challenge?: string;
  timeout?: number;
  userVerification?: "required" | "preferred" | "discouraged";
}

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    // Check if WebAuthn is supported
    if (window.PublicKeyCredential) {
      setIsAvailable(true);
      
      // Check if user has enrolled biometrics
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsEnrolled(available);
      } catch (error) {
        console.error("Error checking biometric enrollment:", error);
      }
    }
  };

  const authenticate = useCallback(async (options: BiometricAuthOptions = {}) => {
    if (!isAvailable) {
      throw new Error("Biometric authentication not available");
    }

    try {
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: new TextEncoder().encode(options.challenge || "authentication-challenge"),
        timeout: options.timeout || 60000,
        userVerification: options.userVerification || "preferred",
        rpId: window.location.hostname,
      };

      const credential = await navigator.credentials.get({
        publicKey,
      }) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Authentication cancelled");
      }

      return {
        success: true,
        credential,
      };
    } catch (error: any) {
      console.error("Biometric authentication error:", error);
      
      if (error.name === "NotAllowedError") {
        throw new Error("Authentication was cancelled or not allowed");
      } else if (error.name === "InvalidStateError") {
        throw new Error("Authenticator is already registered");
      }
      
      throw error;
    }
  }, [isAvailable]);

  const register = useCallback(async (userId: string, userName: string) => {
    if (!isAvailable) {
      throw new Error("Biometric authentication not available");
    }

    try {
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge: new TextEncoder().encode("registration-challenge"),
        rp: {
          name: "Accountant AI",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },  // ES256
          { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
        },
        timeout: 60000,
      };

      const credential = await navigator.credentials.create({
        publicKey,
      }) as PublicKeyCredential | null;

      if (!credential) {
        throw new Error("Registration cancelled");
      }

      return {
        success: true,
        credential,
      };
    } catch (error: any) {
      console.error("Biometric registration error:", error);
      throw error;
    }
  }, [isAvailable]);

  return {
    isAvailable,
    isEnrolled,
    authenticate,
    register,
  };
};
