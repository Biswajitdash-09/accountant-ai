import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, User, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  onSearchToggle?: () => void;
  className?: string;
}

const MobileHeader = ({ onMenuToggle, onSearchToggle, className }: MobileHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { unreadCount } = useRealtimeNotifications();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border/40",
      "bg-background/95 backdrop-blur-xl",
      "transition-all duration-200",
      className
    )}>
      <div className="flex h-14 items-center justify-between px-3 max-w-screen-xl mx-auto">
        {/* Left Section - Menu & Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="h-10 w-10 rounded-xl touch-feedback"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-heading font-semibold text-sm text-foreground hidden xs:block">
              AccountantAI
            </span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchToggle}
            className="h-10 w-10 rounded-xl touch-feedback"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl touch-feedback"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/notifications')}
            className="h-10 w-10 rounded-xl relative touch-feedback"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground border-2 border-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl touch-feedback"
                aria-label="Profile"
              >
                {user ? (
                  <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/notifications')}>
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-auto" variant="secondary">{unreadCount}</Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
