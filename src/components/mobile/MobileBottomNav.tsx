import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  QrCode, 
  BarChart3, 
  Bot 
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 mobile-bottom-safe">
      <div className="flex items-center justify-around px-2 py-2 max-w-screen-xl mx-auto">
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
                  "flex-col gap-0.5 h-14 w-14 rounded-2xl",
                  "bg-gradient-primary text-primary-foreground shadow-lg",
                  "hover:shadow-xl hover:scale-105 transform transition-all duration-200",
                  "active:scale-95 -mt-5"
                )}
              >
                <Link to={item.href} className="flex flex-col items-center">
                  <Icon className="h-6 w-6" />
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
                "flex-col gap-0.5 h-14 w-14 p-1 rounded-xl",
                "transition-all duration-200",
                isActive && "text-primary bg-primary/10"
              )}
            >
              <Link to={item.href} className="flex flex-col items-center w-full">
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "scale-110 text-primary"
                )} />
                <span className={cn(
                  "text-[10px] font-medium truncate",
                  isActive ? "text-primary" : "text-muted-foreground"
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