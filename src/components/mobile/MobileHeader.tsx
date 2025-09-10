import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  className?: string;
}

const MobileHeader = ({ onMenuToggle, className }: MobileHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "mobile-header-safe",
      className
    )}>
      <div className="flex h-14 items-center justify-between px-4 mobile-safe">
        {/* Left Section - Menu & Logo */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="mobile-touch p-2 h-10 w-10"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="font-semibold text-base">Accountant AI</h1>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-2 h-10 w-10"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-2 h-10 w-10 relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs border-2 border-background">
              3
            </Badge>
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-2 h-10 w-10"
            aria-label="Profile"
          >
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile"
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;