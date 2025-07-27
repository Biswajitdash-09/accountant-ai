
import { Bell, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { Link } from "react-router-dom";
import CurrencySelector from "./CurrencySelector";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const isMobile = useIsMobile();

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b backdrop-blur-sm">
      {/* Mobile menu button / Logo */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="hover-scale transition-all duration-200 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Show logo */}
        <div className={cn(isMobile ? "block" : "hidden lg:block")}>
          <h1 className={cn("font-semibold", isMobile ? "text-lg" : "text-xl")}>
            Accountant AI
          </h1>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden sm:block">
          <CurrencySelector />
        </div>
        
        {/* Dark mode toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="hover-scale transition-all duration-200 cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 transition-all duration-200" />
          ) : (
            <Moon className="h-5 w-5 transition-all duration-200" />
          )}
        </Button>
        
        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex hover-scale transition-all duration-200 cursor-pointer"
            asChild
          >
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover-scale transition-all duration-200 cursor-pointer"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="sm:hidden">
              <div className="p-2">
                <CurrencySelector />
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="sm:hidden">
              <Link to="/notifications" className="flex items-center justify-between w-full cursor-pointer">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut} className="cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
