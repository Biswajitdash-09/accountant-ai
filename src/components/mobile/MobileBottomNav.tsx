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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t mobile-bottom-safe">
      <div className="flex items-center justify-around px-2 py-2">
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
                  "mobile-touch flex-col gap-1 h-14 w-14 rounded-full",
                  "bg-primary text-primary-foreground shadow-lg",
                  "hover:bg-primary/90 transform transition-all duration-200",
                  "active:scale-95"
                )}
              >
                <Link to={item.href}>
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
                "mobile-touch flex-col gap-1 h-12 w-16 p-1",
                "transition-all duration-200",
                isActive && "text-primary bg-primary/10"
              )}
            >
              <Link to={item.href}>
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className={cn(
                  "text-xs font-medium truncate",
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