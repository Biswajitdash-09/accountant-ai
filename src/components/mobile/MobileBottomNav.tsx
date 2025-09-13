import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  QrCode, 
  BarChart3, 
  Plus 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MobileBottomNav = () => {
  const location = useLocation();

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
      href: '/barcode',
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
      icon: Plus,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md backdrop-saturate-150 border-t border-border/50 mobile-bottom-safe">
      <div className="flex items-center justify-around px-3 py-2 max-w-screen-xl mx-auto">
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
                  "mobile-touch flex-col gap-1 h-14 w-14 rounded-2xl",
                  "bg-gradient-primary text-primary-foreground shadow-soft",
                  "hover:shadow-medium hover:scale-105 transform transition-all duration-300",
                  "active:scale-95 touch-feedback relative overflow-hidden",
                  "before:absolute before:inset-0 before:bg-white/10 before:opacity-0 before:transition-opacity",
                  "hover:before:opacity-100"
                )}
              >
                <Link to={item.href} className="flex flex-col items-center gap-1">
                  <Icon className="h-6 w-6 relative z-10" />
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
                "mobile-touch flex-col gap-0.5 h-16 w-16 p-2 rounded-xl",
                "transition-all duration-300 touch-feedback relative overflow-hidden",
                "hover:bg-accent/50 active:scale-95",
                isActive && "text-primary bg-primary/10"
              )}
            >
              <Link to={item.href} className="flex flex-col items-center gap-0.5 w-full">
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-300 relative z-10",
                  isActive && "scale-110 text-primary"
                )} />
                <span className={cn(
                  "text-xs font-medium truncate leading-tight relative z-10",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;