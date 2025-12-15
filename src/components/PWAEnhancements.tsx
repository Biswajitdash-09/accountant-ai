import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Bell, WifiOff, X, Share, Plus, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAEnhancements = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('pwa-dismissed') === 'true';
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Handle install prompt (for Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Handle online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be limited.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      // Register for push notifications
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'your-vapid-public-key'
          });
          console.log('Push subscription:', subscription);
        } catch (error) {
          console.error('Failed to subscribe to push notifications:', error);
        }
      }
    } else {
      toast.error('Notifications denied');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-dismissed', 'true');
    toast.success('You can install the app from Profile settings anytime');
  };

  // Don't show if already installed, dismissed, or nothing to show
  if (isStandalone || isDismissed) {
    return (
      <>
        {/* Connection Status Indicator */}
        {!isOnline && (
          <div className="fixed top-4 right-4 z-[60]">
            <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm shadow-lg">
              <WifiOff className="h-3 w-3" />
              Offline
            </div>
          </div>
        )}
      </>
    );
  }

  const showInstallPrompt = isInstallable || isIOS;
  const showNotificationPrompt = notificationPermission !== 'granted';
  
  if (!showInstallPrompt && !showNotificationPrompt) {
    return null;
  }

  return (
    <>
      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm shadow-lg">
            <WifiOff className="h-3 w-3" />
            Offline
          </div>
        </div>
      )}

      {/* PWA Features Card */}
      <Card className={isMobile ? "mb-3 shadow-soft" : "mb-6"}>
        <CardHeader className={isMobile ? "pb-3" : ""}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Install App</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 -mr-2"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {!isMobile && (
            <CardDescription>
              Get the best experience with our mobile app features
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className={isMobile ? "space-y-3 pt-0" : "space-y-3"}>
          {/* Android/Chrome Install */}
          {isInstallable && (
            <div className={isMobile 
              ? "flex items-center justify-between gap-3" 
              : "flex items-center justify-between p-3 bg-accent rounded-lg"
            }>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">Install App</h4>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    Add Accountant AI to your home screen for quick access
                  </p>
                )}
              </div>
              <Button onClick={handleInstall} size="sm" className="shrink-0">
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
            </div>
          )}

          {/* iOS Install Instructions */}
          {isIOS && !isInstallable && (
            <div className={isMobile 
              ? "space-y-2" 
              : "p-3 bg-accent rounded-lg space-y-2"
            }>
              <h4 className="font-medium text-sm">Install on iOS</h4>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Share className="h-4 w-4 text-primary" />
                    <span>1. Tap the Share button</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    <span>2. Select "Add to Home Screen"</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {showNotificationPrompt && (
            <div className={isMobile 
              ? "flex items-center justify-between gap-3" 
              : "flex items-center justify-between p-3 bg-accent rounded-lg"
            }>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">Enable Notifications</h4>
                {!isMobile && (
                  <p className="text-sm text-muted-foreground">
                    Get alerts for payment due dates, budget limits, and more
                  </p>
                )}
              </div>
              <Button onClick={handleNotificationPermission} size="sm" variant="outline" className="shrink-0">
                <Bell className="h-4 w-4 mr-2" />
                Enable
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default PWAEnhancements;

// Export a hook for use in Profile page
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
    return outcome === 'accepted';
  };

  return { isInstallable, isIOS, isStandalone, install };
};