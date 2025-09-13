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
      "sticky top-0 z-50 w-full border-b",
      "bg-background/98 backdrop-blur-md backdrop-saturate-150",
      "mobile-header-safe transition-all duration-300",
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 mobile-safe max-w-screen-xl mx-auto">
        {/* Left Section - Menu & Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="mobile-touch p-3 h-12 w-12 rounded-xl touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-soft">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="font-heading font-semibold text-base text-foreground truncate">
                Accountant AI
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-3 h-12 w-12 rounded-xl touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-3 h-12 w-12 rounded-xl relative touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 text-xs font-medium border-2 border-background rounded-full bg-destructive text-destructive-foreground">
              3
            </Badge>
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-3 h-12 w-12 rounded-xl touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200"
            aria-label="Profile"
          >
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile"
                className="h-7 w-7 rounded-full object-cover ring-2 ring-border"
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