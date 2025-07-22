
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, User, HelpCircle, LogOut, Bot, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

const Header = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  
  // Check if user is in guest mode
  const isGuest = localStorage.getItem('isGuest') === 'true';

  // Extract initials from user's email or name
  const getInitials = () => {
    if (isGuest) return "G";
    if (!user) return "U";
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    return user.email ? user.email[0].toUpperCase() : "U";
  };

  const getUserDisplayName = () => {
    if (isGuest) return "Guest User";
    if (!user) return "User";
    return user.user_metadata?.full_name || user.email || "User";
  };

  const handleLogout = async () => {
    if (isGuest) {
      localStorage.removeItem('isGuest');
      navigate("/");
      return;
    }
    
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center md:hidden">
          <Bot className="h-8 w-8 text-primary mr-2" />
          <span className="text-xl font-bold">Accountant AI</span>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="transition-all duration-200 hover:scale-110"
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative transition-all duration-200 hover:scale-110">
                <Bell className="h-[1.2rem] w-[1.2rem]" />
                {unreadNotifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -right-2 -top-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
                {isGuest ? (
                  <DropdownMenuItem className="cursor-pointer">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Welcome to Demo Mode!</p>
                      <p className="text-xs text-muted-foreground">Explore all features risk-free</p>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">New transaction added</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Tax payment due soon</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Monthly report ready</p>
                        <p className="text-xs text-muted-foreground">Yesterday</p>
                      </div>
                    </DropdownMenuItem>
                  </>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-sm font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-110"
              >
                <Avatar>
                  <AvatarImage src={!isGuest ? (user?.user_metadata?.avatar_url || "") : ""} />
                  <AvatarFallback className={isGuest ? "bg-finance-highlight text-white" : ""}>
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {isGuest && (
                  <Badge variant="secondary" className="absolute -bottom-1 -right-1 text-[8px] px-1">
                    DEMO
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  {isGuest && (
                    <p className="text-xs text-muted-foreground">Demo Mode</p>
                  )}
                  {!isGuest && user?.email && (
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {!isGuest && (
                <>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              
              {isGuest && (
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/auth?signup=true")}>
                  <User className="mr-2 h-4 w-4" />
                  Create Account
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {isGuest ? "Exit Demo" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
