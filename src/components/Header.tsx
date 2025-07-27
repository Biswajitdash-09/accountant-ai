import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import CurrencySelector from "./CurrencySelector";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      {/* Mobile menu button / Logo */}
      <div className="flex items-center gap-4">
        {isMobile && <Sidebar isCollapsed={false} onToggle={onMobileMenuToggle} />}
        
        {/* Show logo on mobile when sidebar is closed */}
        <div className={cn("lg:hidden", !isMobile && "hidden")}>
          <h1 className="text-lg font-semibold">Accountant AI</h1>
        </div>

        {/* Show logo on desktop */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold">Accountant AI</h1>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="hidden sm:block">
          <CurrencySelector />
        </div>
        
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
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
