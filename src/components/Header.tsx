
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Menu, LogOut } from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const Header = ({ onMobileMenuToggle }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    signOut();
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h2 className="hidden lg:block text-lg font-semibold">Welcome to Accountant AI</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
