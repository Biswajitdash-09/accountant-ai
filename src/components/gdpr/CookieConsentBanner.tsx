import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cookie, Settings, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functionality: boolean;
}

const COOKIE_CONSENT_KEY = 'accountant-ai-cookie-consent';

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    functionality: true,
  });

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const saved = JSON.parse(consent);
        setPreferences(saved.preferences);
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
      }
    }
  }, []);

  const saveConsent = (acceptAll: boolean) => {
    const consentData = {
      timestamp: new Date().toISOString(),
      preferences: acceptAll ? {
        essential: true,
        analytics: true,
        marketing: true,
        functionality: true,
      } : preferences,
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
    
    // Dispatch event for analytics tracking
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', {
      detail: consentData.preferences
    }));
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Cannot disable essential
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
      >
        <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-border bg-card/95 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Cookie Preferences</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We use cookies to enhance your experience, analyze site traffic, and personalize content.
                    By clicking "Accept All", you consent to our use of cookies.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 -mt-2 -mr-2"
                  onClick={() => setShowBanner(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Expandable Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Settings className="h-4 w-4" />
                Customize preferences
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 pt-2 border-t">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 mr-4">
                          <Label className="font-medium">Essential Cookies</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Required for the website to function properly
                          </p>
                        </div>
                        <Switch checked disabled className="opacity-50" />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 mr-4">
                          <Label className="font-medium">Analytics Cookies</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Help us understand how you use our site
                          </p>
                        </div>
                        <Switch
                          checked={preferences.analytics}
                          onCheckedChange={(v) => handlePreferenceChange('analytics', v)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 mr-4">
                          <Label className="font-medium">Marketing Cookies</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Used to deliver personalized advertisements
                          </p>
                        </div>
                        <Switch
                          checked={preferences.marketing}
                          onCheckedChange={(v) => handlePreferenceChange('marketing', v)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex-1 mr-4">
                          <Label className="font-medium">Functionality Cookies</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Remember your preferences and settings
                          </p>
                        </div>
                        <Switch
                          checked={preferences.functionality}
                          onCheckedChange={(v) => handlePreferenceChange('functionality', v)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                  onClick={() => saveConsent(false)}
                >
                  Save Preferences
                </Button>
                <Button
                  className="flex-1 min-h-[44px]"
                  onClick={() => saveConsent(true)}
                >
                  Accept All
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Learn more in our{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a>.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
