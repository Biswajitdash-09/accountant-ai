
import { Bell, User, Sun, Moon, CreditCard, Check, Trash2, AlertCircle, TrendingUp, DollarSign, Lock } from "lucide-react";
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
import { useBiometric } from "@/contexts/BiometricContext";
import { useTheme } from "@/hooks/useTheme";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CurrencySelector from "./CurrencySelector";
import CreditBalance from "./CreditBalance";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useArnoldNotifications } from "@/hooks/useArnoldNotifications";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  onMobileMenuToggle: () => void;
  onSearchToggle?: () => void;
}

const Header = ({ onMobileMenuToggle, onSearchToggle }: HeaderProps) => {
  const { signOut } = useAuth();
  const { isEnabled: biometricEnabled, lock: lockApp } = useBiometric();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Unified notifications
  const {
    notifications: realtimeNotifications,
    unreadCount: realtimeUnread,
    markAsRead: markRealtimeRead,
    markAllAsRead: markAllRealtimeRead,
  } = useRealtimeNotifications();
  
  const {
    notifications: arnoldNotifications,
    unreadCount: arnoldUnread,
    markAsRead: markArnoldRead,
    markAllAsRead: markAllArnoldRead,
    deleteNotification: deleteArnoldNotification,
  } = useArnoldNotifications();

  const totalUnread = realtimeUnread + arnoldUnread;

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

  const handleRealtimeClick = (notification: any) => {
    markRealtimeRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleArnoldClick = (notification: any) => {
    markArnoldRead.mutate(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getArnoldIcon = (type: string) => {
    switch (type) {
      case "spending":
        return <TrendingUp className="h-4 w-4" />;
      case "tax":
        return <AlertCircle className="h-4 w-4" />;
      case "investment":
      case "savings":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
      case "urgent":
        return "text-destructive";
      case "medium":
        return "text-yellow-500";
      default:
        return "text-blue-500";
    }
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
          
          {/* Unified Notification Center */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {totalUnread > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] animate-pulse"
                  >
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between border-b p-3">
                  <TabsList className="h-8">
                    <TabsTrigger value="all" className="text-xs px-3">
                      All {totalUnread > 0 && `(${totalUnread})`}
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="text-xs px-3">
                      Insights {arnoldUnread > 0 && `(${arnoldUnread})`}
                    </TabsTrigger>
                  </TabsList>
                  {totalUnread > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        markAllRealtimeRead();
                        markAllArnoldRead.mutate();
                      }}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <TabsContent value="all" className="m-0">
                  <ScrollArea className="h-[350px]">
                    {realtimeNotifications.length === 0 && arnoldNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Bell className="h-10 w-10 mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {[...realtimeNotifications, ...arnoldNotifications]
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .slice(0, 20)
                          .map((notification: any) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "p-3 hover:bg-accent cursor-pointer transition-colors",
                                !notification.is_read && "bg-accent/50"
                              )}
                              onClick={() => {
                                if ('notification_type' in notification) {
                                  handleArnoldClick(notification);
                                } else {
                                  handleRealtimeClick(notification);
                                }
                              }}
                            >
                              <div className="flex gap-2">
                                <div className={cn("mt-0.5 shrink-0", getPriorityColor(notification.priority))}>
                                  {'notification_type' in notification 
                                    ? getArnoldIcon(notification.notification_type)
                                    : <Bell className="h-4 w-4" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                  <p className="text-sm font-medium leading-tight truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="insights" className="m-0">
                  <ScrollArea className="h-[350px]">
                    {arnoldNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <Bell className="h-10 w-10 mb-2 opacity-50" />
                        <p className="text-sm">No AI insights</p>
                        <p className="text-xs">Arnold will notify you of important insights</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {arnoldNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              "p-3 hover:bg-accent cursor-pointer transition-colors",
                              !notification.is_read && "bg-accent/50"
                            )}
                            onClick={() => handleArnoldClick(notification)}
                          >
                            <div className="flex gap-2">
                              <div className={cn("mt-0.5 shrink-0", getPriorityColor(notification.priority))}>
                                {getArnoldIcon(notification.notification_type)}
                              </div>
                              <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium leading-tight truncate">
                                    {notification.title}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteArnoldNotification.mutate(notification.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              
              <Separator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full text-xs h-8"
                  onClick={() => navigate('/notifications')}
                >
                  View all notifications
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Currency Selector - Hidden on mobile */}
          <div className="hidden sm:flex">
            <CurrencySelector />
          </div>
          
          {/* Biometric Lock Button - Only show if enabled */}
          {biometricEnabled && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={lockApp}
                    className="btn-enhanced mobile-touch h-9 w-9"
                    aria-label="Lock app"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lock App</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
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
                      {totalUnread > 0 && (
                        <Badge variant="destructive" className="ml-2 h-4 min-w-[1rem] text-xs">
                          {totalUnread > 99 ? '99+' : totalUnread}
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
