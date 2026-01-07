import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Feature flag and A/B testing hook

interface Experiment {
  name: string;
  variants: string[];
  weights?: number[]; // Optional weights for variant distribution
  defaultVariant?: string;
}

interface ExperimentResult {
  variant: string;
  isEnabled: boolean;
}

// Define your experiments here
const EXPERIMENTS: Record<string, Experiment> = {
  'new_pricing_page': {
    name: 'new_pricing_page',
    variants: ['control', 'variant_a', 'variant_b'],
    weights: [0.5, 0.25, 0.25],
  },
  'enhanced_onboarding': {
    name: 'enhanced_onboarding',
    variants: ['control', 'short_flow'],
    weights: [0.5, 0.5],
  },
  'credit_upsell_modal': {
    name: 'credit_upsell_modal',
    variants: ['control', 'urgency', 'social_proof'],
    weights: [0.34, 0.33, 0.33],
  },
  'ai_chat_personality': {
    name: 'ai_chat_personality',
    variants: ['professional', 'friendly', 'concise'],
    weights: [0.34, 0.33, 0.33],
  },
};

// Feature flags - simple on/off toggles
const FEATURE_FLAGS: Record<string, boolean> = {
  'dark_mode': true,
  'voice_assistant': true,
  'crypto_tracking': true,
  'referral_program': true,
  'push_notifications': true,
  'advanced_analytics': true,
  'api_access': false, // Gated feature
  'team_collaboration': false, // Coming soon
};

// Get a consistent variant based on user ID (deterministic assignment)
function getVariantForUser(userId: string, experiment: Experiment): string {
  // Create a simple hash from user ID + experiment name
  let hash = 0;
  const key = `${userId}:${experiment.name}`;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Normalize hash to 0-1 range
  const normalized = Math.abs(hash) / 2147483647;
  
  // Use weights to determine variant
  const weights = experiment.weights || 
    experiment.variants.map(() => 1 / experiment.variants.length);
  
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (normalized < cumulative) {
      return experiment.variants[i];
    }
  }
  
  return experiment.defaultVariant || experiment.variants[0];
}

export const useExperiment = (experimentName: string): ExperimentResult => {
  const { user } = useAuth();
  const [variant, setVariant] = useState<string>('control');

  useEffect(() => {
    const experiment = EXPERIMENTS[experimentName];
    
    if (!experiment) {
      console.warn(`Experiment "${experimentName}" not found`);
      return;
    }

    // For logged-in users, use deterministic assignment
    if (user?.id) {
      const assignedVariant = getVariantForUser(user.id, experiment);
      setVariant(assignedVariant);
      
      // Log experiment exposure
      logExperimentExposure(experimentName, assignedVariant, user.id);
    } else {
      // For anonymous users, use session-based assignment
      const sessionKey = `exp_${experimentName}`;
      let sessionVariant = sessionStorage.getItem(sessionKey);
      
      if (!sessionVariant) {
        // Random assignment for anonymous users
        const randomIndex = Math.floor(Math.random() * experiment.variants.length);
        sessionVariant = experiment.variants[randomIndex];
        sessionStorage.setItem(sessionKey, sessionVariant);
      }
      
      setVariant(sessionVariant);
    }
  }, [experimentName, user?.id]);

  return {
    variant,
    isEnabled: variant !== 'control',
  };
};

export const useFeatureFlag = (flagName: string): boolean => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check local override first
    const localOverride = localStorage.getItem(`ff_${flagName}`);
    if (localOverride !== null) {
      setIsEnabled(localOverride === 'true');
      return;
    }

    // Use default flag value
    setIsEnabled(FEATURE_FLAGS[flagName] ?? false);
  }, [flagName]);

  return isEnabled;
};

// Track experiment conversions
export const useTrackConversion = () => {
  const { user } = useAuth();
  
  return useCallback((experimentName: string, conversionEvent: string, metadata?: Record<string, any>) => {
    const experiment = EXPERIMENTS[experimentName];
    if (!experiment) return;

    const variant = user?.id 
      ? getVariantForUser(user.id, experiment)
      : sessionStorage.getItem(`exp_${experimentName}`) || 'control';

    // Log conversion
    logExperimentConversion(experimentName, variant, conversionEvent, user?.id, metadata);
  }, [user?.id]);
};

// Logging functions (would send to analytics in production)
function logExperimentExposure(experimentName: string, variant: string, userId?: string) {
  console.log('[Experiment] Exposure:', { experimentName, variant, userId, timestamp: new Date().toISOString() });
  
  // In production, send to analytics service
  // analytics.track('experiment_exposure', { experimentName, variant, userId });
}

function logExperimentConversion(
  experimentName: string, 
  variant: string, 
  conversionEvent: string, 
  userId?: string,
  metadata?: Record<string, any>
) {
  console.log('[Experiment] Conversion:', { 
    experimentName, 
    variant, 
    conversionEvent, 
    userId, 
    metadata,
    timestamp: new Date().toISOString() 
  });
  
  // In production, send to analytics service
  // analytics.track('experiment_conversion', { experimentName, variant, conversionEvent, userId, ...metadata });
}

// Admin utilities for feature flag management
export const setFeatureFlagOverride = (flagName: string, enabled: boolean | null) => {
  if (enabled === null) {
    localStorage.removeItem(`ff_${flagName}`);
  } else {
    localStorage.setItem(`ff_${flagName}`, String(enabled));
  }
};

export const getActiveExperiments = (): string[] => {
  return Object.keys(EXPERIMENTS);
};

export const getFeatureFlags = (): Record<string, boolean> => {
  return { ...FEATURE_FLAGS };
};

export default useExperiment;
