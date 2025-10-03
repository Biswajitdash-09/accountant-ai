import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  onSearchToggle?: () => void;
  className?: string;
}

const MobileHeader = ({ onMenuToggle, onSearchToggle, className }: MobileHeaderProps) => {
  const { user } = useAuth();

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/50",
      "bg-background/95 backdrop-blur-xl backdrop-saturate-150",
      "mobile-header-safe transition-all duration-300 shadow-soft",
      className
    )}>
      <div className="flex h-20 items-center justify-between px-5 mobile-safe max-w-screen-xl mx-auto">
        {/* Left Section - Menu & Logo */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="mobile-touch p-3 h-14 w-14 rounded-2xl touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200 shadow-soft hover:shadow-medium"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-medium">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="font-heading font-bold text-lg text-foreground truncate">
                Accountant AI
              </h1>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchToggle}
            className="mobile-touch p-3 h-14 w-14 rounded-2xl touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200 shadow-soft hover:shadow-medium"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-3 h-14 w-14 rounded-2xl relative touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200 shadow-soft hover:shadow-medium"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge className="absolute top-0 right-0 h-6 w-6 p-0 text-xs font-bold border-2 border-background rounded-full bg-destructive text-destructive-foreground shadow-medium animate-pulse">
              3
            </Badge>
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-touch p-3 h-14 w-14 rounded-2xl touch-feedback hover:bg-accent/50 active:scale-95 transition-all duration-200 shadow-soft hover:shadow-medium"
            aria-label="Profile"
          >
            {user ? (
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 shadow-soft">
                <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;