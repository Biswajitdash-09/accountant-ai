
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet,
  BarChart3,
  Calculator,
  Upload,
  Bot,
  TrendingUp,
  User,
  Zap,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: Receipt,
    },
    {
      href: "/accounts",
      label: "Accounts",
      icon: Wallet,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: FileText,
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      href: "/advanced-features",
      label: "Advanced",
      icon: Zap,
    },
    {
      href: "/tax",
      label: "Tax Center",
      icon: Calculator,
    },
    {
      href: "/upload",
      label: "Documents",
      icon: Upload,
    },
    {
      href: "/assistant",
      label: "AI Assistant",
      icon: Bot,
    },
    {
      href: "/markets",
      label: "Markets",
      icon: TrendingUp,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
  ];

  const SidebarContent = ({ isMobileSheet = false }: { isMobileSheet?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="font-semibold text-lg truncate">Accountant AI</h2>
          </div>
        )}
        
        {/* Collapse toggle - only show on desktop */}
        {!isMobileSheet && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col space-y-1 py-4">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "justify-start font-normal h-10",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
                isCollapsed && !isMobileSheet ? "px-2 justify-center" : "px-3"
              )}
              onClick={() => isMobileSheet && setMobileSheetOpen(false)}
            >
              <Link to={item.href} className="flex items-center gap-3 w-full">
                <item.icon className="h-4 w-4 shrink-0" />
                {(!isCollapsed || isMobileSheet) && (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          <span className={cn(isCollapsed && !isMobileSheet ? "sr-only" : "")}>
            {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </span>
        </Button>
      </div>
    </div>
  );

  // Mobile view with Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent isMobileSheet={true} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-r border-border transition-all duration-200",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
