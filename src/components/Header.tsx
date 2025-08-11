
import { Bell, User, Sun, Moon, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { Link, useLocation } from "react-router-dom";
import CurrencySelector from "./CurrencySelector";
import CreditBalance from "./CreditBalance";
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
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: { [key: string]: string } = {
      "/dashboard": "Dashboard",
      "/transactions": "Transactions",
      "/accounts": "Accounts", 
      "/reports": "Reports",
      "/analytics": "Analytics",
      "/advanced-features": "Advanced Features",
      "/tax": "Tax Center",
      "/upload": "Documents",
      "/assistant": "AI Assistant",
      "/markets": "Markets",
      "/profile": "Profile",
      "/notifications": "Notifications",
      "/pricing": "Buy Credits",
    };
    return titles[path] || "Accountant AI";
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b ui-glass mobile-header-safe">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuToggle}
              className="btn-enhanced mobile-touch h-9 w-9 flex-shrink-0"
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <div className={cn("h-8 w-8 bg-primary rounded-lg flex items-center justify-center", !isMobile && "hidden lg:flex")}>
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-base sm:text-lg text-foreground truncate">
                {isMobile ? getPageTitle() : "Accountant AI"}
              </h1>
              {!isMobile && location.pathname !== "/dashboard" && (
                <p className="text-xs text-muted-foreground">{getPageTitle()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Credit Balance - Always visible */}
          <div className="hidden sm:flex"><CreditBalance showBuyButton={false} /></div>
          
          {/* Buy Credits Button - Show on non-pricing pages */}
          {location.pathname !== "/pricing" && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden sm:flex h-9 gap-2 btn-enhanced"
            >
              <Link to="/pricing">
                <CreditCard className="h-3 w-3" />
                Buy Credits
              </Link>
            </Button>
          )}
          
          {/* Currency Selector - Hidden on mobile */}
          <div className="hidden sm:flex">
            <CurrencySelector />
          </div>
          
          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="btn-enhanced mobile-touch h-9 w-9"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-yellow-500 transition-colors" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-colors" />
            )}
          </Button>
          
          {/* Notifications - Hidden on mobile */}
          <div className="relative hidden sm:block">
            <Button 
              variant="ghost" 
              size="icon" 
              className="btn-enhanced mobile-touch h-9 w-9 relative"
              asChild
              aria-label="Notifications"
            >
              <Link to="/notifications">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] animate-pulse min-w-[1.25rem]"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="btn-enhanced mobile-touch h-9 w-9 border-2 border-transparent hover:border-primary/20 transition-all"
                aria-label="User menu"
              >
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 ui-glass shadow-lg border mr-2 sm:mr-0"
              sideOffset={8}
            >
              <DropdownMenuLabel className="font-medium">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Mobile-only items */}
              {isMobile && (
                <>
                  <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                    <div className="p-2" onPointerDown={(e) => e.stopPropagation()}>
                      <CurrencySelector />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/notifications" 
                      className="flex items-center justify-between w-full cursor-pointer py-2"
                    >
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2 h-4 min-w-[1rem] text-xs">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {/* Buy Credits - Always visible in menu */}
              <DropdownMenuItem asChild>
                <Link to="/pricing" className="cursor-pointer flex items-center gap-2 py-2">
                  <CreditCard className="h-4 w-4" />
                  Buy Credits
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* Common items */}
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer flex items-center gap-2 py-2">
                  <User className="h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={signOut} 
                className="cursor-pointer text-destructive focus:text-destructive py-2"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
