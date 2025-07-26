
import { Bell, Menu, User } from "lucide-react";
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

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const { signOut } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMobileMenuToggle}
        className="lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Logo/Title - hidden on mobile when menu button is shown */}
      <div className="hidden lg:block">
        <h1 className="text-xl font-semibold">Accountant AI</h1>
      </div>

      {/* Right side items */}
      <div className="flex items-center space-x-4">
        <CurrencySelector />
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
