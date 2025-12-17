import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Download, Share, Plus, Check, Smartphone, Apple, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InstallAppSheet = ({ open, onOpenChange }: InstallAppSheetProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('App installed successfully!');
        onOpenChange(false);
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
      toast.error('Installation failed. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };

  if (isStandalone) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <SheetTitle>Already Installed</SheetTitle>
            <SheetDescription>
              Accountant AI is already installed on your device. Enjoy the full app experience!
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary-foreground" />
          </div>
          <SheetTitle className="text-xl">Install Accountant AI</SheetTitle>
          <SheetDescription>
            Get instant access from your home screen with offline support
          </SheetDescription>
        </SheetHeader>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 py-4 border-y border-border">
          {[
            { icon: '⚡', label: 'Faster' },
            { icon: '📴', label: 'Offline' },
            { icon: '🔔', label: 'Alerts' },
          ].map((benefit) => (
            <div key={benefit.label} className="text-center">
              <div className="text-2xl mb-1">{benefit.icon}</div>
              <p className="text-xs text-muted-foreground">{benefit.label}</p>
            </div>
          ))}
        </div>

        {/* Installation Instructions */}
        <div className="py-6 space-y-4">
          {deferredPrompt ? (
            // Android/Chrome - One-click install
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <Chrome className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-sm">Android / Chrome</p>
                  <p className="text-xs text-muted-foreground">One-tap installation</p>
                </div>
              </div>
              
              <Button 
                onClick={handleInstall} 
                className="w-full h-14 text-base gap-3"
                disabled={isInstalling}
              >
                <Download className="h-5 w-5" />
                {isInstalling ? 'Installing...' : 'Install App Now'}
              </Button>
            </div>
          ) : isIOS ? (
            // iOS - Manual instructions
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                <Apple className="h-8 w-8" />
                <div>
                  <p className="font-medium text-sm">iPhone / iPad</p>
                  <p className="text-xs text-muted-foreground">Install via Safari</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-center">Follow these steps:</p>
                
                {[
                  { step: 1, icon: Share, text: 'Tap the Share button in Safari', highlight: true },
                  { step: 2, icon: Plus, text: 'Scroll down and tap "Add to Home Screen"' },
                  { step: 3, icon: Check, text: 'Tap "Add" to confirm' },
                ].map(({ step, icon: Icon, text, highlight }) => (
                  <div 
                    key={step}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border",
                      highlight ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      highlight ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Step {step}</p>
                      <p className="text-sm font-medium">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Make sure you're using Safari browser for this to work
              </p>
            </div>
          ) : (
            // Fallback - Generic instructions
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Use Chrome on Android or Safari on iOS to install this app
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Chrome className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs">Chrome</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Apple className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs">Safari</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button 
          variant="ghost" 
          className="w-full" 
          onClick={() => onOpenChange(false)}
        >
          Maybe Later
        </Button>
      </SheetContent>
    </Sheet>
  );
};

export default InstallAppSheet;
