import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Analytics event types for type safety
export type AnalyticsEvent = 
  // Authentication events
  | 'signup_started'
  | 'signup_completed'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  // Onboarding events
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'onboarding_skipped'
  // Feature usage events
  | 'transaction_created'
  | 'transaction_deleted'
  | 'account_created'
  | 'document_uploaded'
  | 'report_generated'
  | 'ai_chat_started'
  | 'ai_chat_message_sent'
  | 'voice_command_used'
  | 'tax_calculation_run'
  | 'budget_created'
  | 'goal_created'
  | 'barcode_scanned'
  // Payment events
  | 'pricing_page_viewed'
  | 'checkout_started'
  | 'payment_completed'
  | 'payment_failed'
  | 'subscription_upgraded'
  | 'subscription_cancelled'
  // Navigation events
  | 'page_viewed'
  | 'feature_discovered'
  // Engagement events
  | 'notification_clicked'
  | 'referral_link_copied'
  | 'feedback_submitted'
  | 'help_article_viewed'
  | 'pwa_installed';

interface TrackEventParams {
  event: AnalyticsEvent;
  properties?: Record<string, unknown>;
}

// Check if analytics are allowed based on cookie consent
const isAnalyticsAllowed = (): boolean => {
  try {
    const consent = localStorage.getItem('accountant-ai-cookie-consent');
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.preferences?.analytics === true;
  } catch {
    return false;
  }
};

export const useAnalyticsTracking = () => {
  const { user } = useAuth();

  // Track page views automatically
  useEffect(() => {
    if (!isAnalyticsAllowed()) return;

    const handleRouteChange = () => {
      const path = window.location.pathname;
      trackEvent({
        event: 'page_viewed',
        properties: {
          path,
          title: document.title,
          referrer: document.referrer,
        },
      });
    };

    // Track initial page view
    handleRouteChange();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Track event function
  const trackEvent = useCallback(({ event, properties = {} }: TrackEventParams) => {
    if (!isAnalyticsAllowed()) return;

    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      userId: user?.id || 'anonymous',
      sessionId: getSessionId(),
      properties: {
        ...properties,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', eventData);
    }

    // Store locally for batch sending
    storeAnalyticsEvent(eventData);

    // Send to analytics endpoint (if configured)
    sendToAnalytics(eventData);
  }, [user?.id]);

  // Identify user for analytics
  const identify = useCallback((traits: Record<string, unknown> = {}) => {
    if (!isAnalyticsAllowed() || !user) return;

    const identifyData = {
      userId: user.id,
      email: user.email,
      traits: {
        ...traits,
        createdAt: user.created_at,
      },
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.log('👤 Analytics Identify:', identifyData);
    }
  }, [user]);

  // Track conversion funnel
  const trackConversion = useCallback((step: string, funnelName: string, properties?: Record<string, unknown>) => {
    trackEvent({
      event: 'onboarding_step_completed',
      properties: {
        step,
        funnelName,
        ...properties,
      },
    });
  }, [trackEvent]);

  // Track timing for performance
  const trackTiming = useCallback((category: string, variable: string, timeMs: number) => {
    if (!isAnalyticsAllowed()) return;

    const timingData = {
      category,
      variable,
      timeMs,
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.log('⏱️ Analytics Timing:', timingData);
    }
  }, []);

  return {
    trackEvent,
    identify,
    trackConversion,
    trackTiming,
    isAnalyticsAllowed,
  };
};

// Helper: Get or create session ID
const getSessionId = (): string => {
  const SESSION_KEY = 'analytics-session-id';
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

// Helper: Store events locally for reliability
const storeAnalyticsEvent = (eventData: Record<string, unknown>) => {
  const EVENTS_KEY = 'analytics-events-queue';
  try {
    const existing = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    existing.push(eventData);
    // Keep only last 100 events to prevent storage bloat
    const trimmed = existing.slice(-100);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to store analytics event:', e);
  }
};

// Helper: Send to analytics backend
const sendToAnalytics = async (eventData: Record<string, unknown>) => {
  // This could be connected to your analytics edge function
  // For now, we'll just log it
  try {
    // Uncomment when analytics endpoint is ready:
    // await supabase.functions.invoke('track-analytics', { body: eventData });
  } catch (e) {
    console.error('Failed to send analytics:', e);
  }
};

// Export standalone track function for non-hook contexts
export const trackAnalyticsEvent = (event: AnalyticsEvent, properties?: Record<string, unknown>) => {
  if (!isAnalyticsAllowed()) return;
  
  const eventData = {
    event,
    timestamp: new Date().toISOString(),
    properties,
  };
  
  if (import.meta.env.DEV) {
    console.log('📊 Analytics Event:', eventData);
  }
  
  storeAnalyticsEvent(eventData);
};
