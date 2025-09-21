import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Bell, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

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

  useEffect(() => {
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

    // Handle install prompt
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
            applicationServerKey: 'your-vapid-public-key' // You'll need to generate VAPID keys
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

  // Don't show install prompt if already installed or not installable
  if (!isInstallable && notificationPermission === 'granted') {
    return null;
  }

  return (
    <>
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        {!isOnline && (
          <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm">
            <WifiOff className="h-3 w-3" />
            Offline
          </div>
        )}
      </div>

      {/* PWA Features Card */}
      {(isInstallable || notificationPermission !== 'granted') && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Enhance Your Experience
            </CardTitle>
            <CardDescription>
              Get the best experience with our mobile app features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isInstallable && (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <h4 className="font-medium">Install App</h4>
                  <p className="text-sm text-muted-foreground">
                    Add Accountant AI to your home screen for quick access
                  </p>
                </div>
                <Button onClick={handleInstall} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
              </div>
            )}

            {notificationPermission !== 'granted' && (
              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div>
                  <h4 className="font-medium">Enable Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Get alerts for payment due dates, budget limits, and more
                  </p>
                </div>
                <Button onClick={handleNotificationPermission} size="sm" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Enable
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PWAEnhancements;