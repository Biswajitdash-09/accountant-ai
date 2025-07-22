
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut, User } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold">Accountant AI</h1>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        {user && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="ml-2"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
