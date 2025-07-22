
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Settings, User, HelpCircle, LogOut } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  // Extract initials from user's email or name
  const getInitials = () => {
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

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-2xl font-bold md:hidden">IntellyFin</div>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-[1.2rem] w-[1.2rem]" />
                {unreadNotifications > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-finance-highlight text-[10px] text-white">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
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
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center text-sm font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
