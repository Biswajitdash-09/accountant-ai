import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Bell, WifiOff, X, Share, Plus, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
    toast.success('Install from Profile settings anytime');
  };

  // Don't show if already installed or dismissed
  if (isStandalone || isDismissed) {
    return (
      <>
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60]">
            <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
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

  // Mobile: Compact inline banner
  if (isMobile) {
    return (
      <>
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60]">
            <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
              <WifiOff className="h-3 w-3" />
              Offline
            </div>
          </div>
        )}

        {/* Compact Mobile Banner */}
        <div className="mx-4 mt-3">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl",
            "bg-primary/5 border border-primary/20"
          )}>
            <Smartphone className="h-5 w-5 text-primary shrink-0" />
            
            <div className="flex-1 min-w-0">
              {isInstallable ? (
                <p className="text-xs font-medium text-foreground">
                  Install app for best experience
                </p>
              ) : isIOS ? (
                <p className="text-xs text-muted-foreground">
                  <Share className="h-3 w-3 inline mr-1" />
                  Share → Add to Home Screen
                </p>
              ) : showNotificationPrompt ? (
                <p className="text-xs font-medium text-foreground">
                  Enable notifications
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {isInstallable && (
                <Button onClick={handleInstall} size="sm" className="h-8 text-xs px-3">
                  <Download className="h-3 w-3 mr-1" />
                  Install
                </Button>
              )}
              {!isInstallable && showNotificationPrompt && (
                <Button onClick={handleNotificationPermission} size="sm" variant="outline" className="h-8 text-xs px-3">
                  <Bell className="h-3 w-3 mr-1" />
                  Enable
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop: Standard card layout
  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-[60]">
          <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm shadow-lg">
            <WifiOff className="h-3 w-3" />
            Offline
          </div>
        </div>
      )}

      {/* Desktop Banner */}
      <div className="mb-4 p-4 rounded-lg bg-accent/50 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium text-sm">Install Accountant AI</h4>
              <p className="text-xs text-muted-foreground">Get quick access from your home screen</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isInstallable && (
              <Button onClick={handleInstall} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
            )}
            {isIOS && !isInstallable && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Share className="h-4 w-4" /> Share → Add to Home Screen
              </div>
            )}
            {showNotificationPrompt && (
              <Button onClick={handleNotificationPermission} size="sm" variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
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