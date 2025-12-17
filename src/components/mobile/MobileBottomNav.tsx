import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  QrCode, 
  BarChart3, 
  Bot,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InstallAppSheet } from './InstallAppSheet';
import { usePWAInstall } from '@/components/PWAEnhancements';

const MobileBottomNav = () => {
  const location = useLocation();
  const [showInstall, setShowInstall] = useState(false);
  const { isInstallable, isIOS, isStandalone } = usePWAInstall();
  
  const showInstallOption = !isStandalone && (isInstallable || isIOS);

  const navItems = [
    {
      href: '/dashboard',
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      href: '/transactions',
      label: 'Transactions',
      icon: Receipt,
    },
    {
      href: '/scanner',
      label: 'Scan',
      icon: QrCode,
      isCenter: true,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      href: '/assistant',
      label: 'AI',
      icon: Bot,
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1.5 max-w-screen-xl mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <Button
                  key={item.href}
                  asChild
                  size="sm"
                  className={cn(
                    "flex-col gap-0 h-12 w-12 rounded-2xl p-0",
                    "bg-gradient-primary text-primary-foreground shadow-lg",
                    "hover:shadow-xl active:scale-95 transform transition-all duration-200",
                    "-mt-4"
                  )}
                >
                  <Link to={item.href} className="flex flex-col items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col gap-0 h-12 w-12 p-0 rounded-xl",
                  "transition-all duration-200 touch-manipulation",
                  isActive && "text-primary bg-primary/10"
                )}
              >
                <Link to={item.href} className="flex flex-col items-center justify-center w-full h-full">
                  <Icon className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive && "scale-110 text-primary"
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium mt-0.5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              </Button>
            );
          })}
          
          {/* Install Button - Only show if not installed */}
          {showInstallOption && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstall(true)}
              className={cn(
                "flex-col gap-0 h-12 w-12 p-0 rounded-xl",
                "transition-all duration-200 touch-manipulation",
                "text-primary"
              )}
            >
              <Download className="h-5 w-5" />
              <span className="text-[10px] font-medium mt-0.5">Install</span>
            </Button>
          )}
        </div>
      </nav>
      
      <InstallAppSheet open={showInstall} onOpenChange={setShowInstall} />
    </>
  );
};

export default MobileBottomNav;