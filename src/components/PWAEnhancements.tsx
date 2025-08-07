import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  Gauge,
  Zap,
  Monitor,
  Bell,
  Palette,
  Settings,
  CheckCircle,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";

interface PWAFeatures {
  offlineSupport: boolean;
  pushNotifications: boolean;
  installPrompt: boolean;
  backgroundSync: boolean;
}

const PWAEnhancements = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [features, setFeatures] = useState<PWAFeatures>({
    offlineSupport: false,
    pushNotifications: false,
    installPrompt: false,
    backgroundSync: false
  });

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setFeatures(prev => ({ ...prev, installPrompt: true }));
    };

    // Listen for online/offline status
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    const handleOfflineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    
    checkInstalled();
    
    // Enable PWA features
    setFeatures(prev => ({
      ...prev,
      offlineSupport: 'serviceWorker' in navigator,
      pushNotifications: 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
    }));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
      toast({
        title: "App installed!",
        description: "You can now access the app from your home screen.",
      });
    }
    setInstallPrompt(null);
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast({
        title: "Notifications enabled!",
        description: "You'll receive important updates and reminders.",
      });
    }
  };

  const performanceScore = 85; // Mock score - in real app would be calculated
  const mobileOptimization = 92;
  const loadTime = 1.2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-bold mb-2">PWA & Performance</h3>
              <p className="opacity-90">Progressive Web App features and mobile optimization</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-green-400" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-400" />
                  )}
                  <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              <Smartphone className="h-12 w-12 opacity-75" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Performance</span>
                  <span className="font-bold">{performanceScore}/100</span>
                </div>
                <Progress value={performanceScore} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  Excellent performance score
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Mobile Optimization</span>
                  <span className="font-bold">{mobileOptimization}/100</span>
                </div>
                <Progress value={mobileOptimization} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  Highly optimized for mobile devices
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{loadTime}s</p>
                  <p className="text-sm text-muted-foreground">Load Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">A+</p>
                  <p className="text-sm text-muted-foreground">Grade</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PWA Features */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Zap className="h-5 w-5" />
              PWA Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  <Label className="text-sm">Offline Support</Label>
                </div>
                <div className="flex items-center gap-2">
                  {features.offlineSupport ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Badge variant="outline">Not Available</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label className="text-sm">Push Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  {features.pushNotifications ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={requestNotificationPermission}
                    >
                      Enable
                    </Button>
                  ) : (
                    <Badge variant="outline">Not Available</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <Label className="text-sm">Install App</Label>
                </div>
                <div className="flex items-center gap-2">
                  {isInstalled ? (
                    <Badge className="bg-green-100 text-green-800">
                      Installed
                    </Badge>
                  ) : installPrompt ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleInstallApp}
                    >
                      Install
                    </Button>
                  ) : (
                    <Badge variant="outline">Not Available</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Label className="text-sm">Background Sync</Label>
                </div>
                <div className="flex items-center gap-2">
                  {features.backgroundSync ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Badge variant="outline">Not Available</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Optimizations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading">Mobile Optimizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center p-4 border rounded-lg"
              >
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h4 className="font-medium mb-1">Responsive Design</h4>
                <p className="text-sm text-muted-foreground">
                  Optimized for all screen sizes
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-4 border rounded-lg"
              >
                <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <h4 className="font-medium mb-1">Fast Loading</h4>
                <p className="text-sm text-muted-foreground">
                  Lazy loading and code splitting
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-4 border rounded-lg"
              >
                <Monitor className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h4 className="font-medium mb-1">Touch Optimized</h4>
                <p className="text-sm text-muted-foreground">
                  Large touch targets and gestures
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 border rounded-lg"
              >
                <Palette className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h4 className="font-medium mb-1">Dark Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic theme switching
                </p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Performance Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start gap-2">
              <Download className="h-4 w-4" />
              Clear Cache
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Zap className="h-4 w-4" />
              Optimize Images
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Globe className="h-4 w-4" />
              Update Service Worker
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Gauge className="h-4 w-4" />
              Run Performance Audit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAEnhancements;