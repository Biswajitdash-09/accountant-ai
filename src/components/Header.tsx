
import { Bell, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
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
  const isMobile = useIsMobile();

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      {/* Mobile menu button / Logo */}
      <div className="flex items-center gap-4">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="hover-scale transition-all duration-200"
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
          className="hover-scale transition-all duration-200"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden sm:flex hover-scale transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover-scale transition-all duration-200"
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
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
