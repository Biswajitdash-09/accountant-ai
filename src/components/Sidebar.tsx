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
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      label: "Document Upload",
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

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-secondary border-r border-muted/50",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden absolute top-2 right-2"
            onClick={onToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-60 p-0">
          <SheetHeader className="pl-6 pr-4 pt-4 pb-2">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navigate your dashboard</SheetDescription>
          </SheetHeader>
          <Separator />
          <ScrollArea className="h-[calc(100vh-100px)]">
            <div className="flex flex-col space-y-1 py-4">
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    "w-full justify-start pl-6 font-normal",
                    location.pathname === item.href
                      ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                      : "hover:bg-secondary-foreground hover:text-secondary-foreground"
                  )}
                >
                  <Link to={item.href} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={handleSignOut}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Menu */}
      <ScrollArea className="h-[calc(100vh-80px)] md:block hidden">
        <div className="flex flex-col space-y-1 py-4">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start pl-6 font-normal",
                location.pathname === item.href
                  ? "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                  : "hover:bg-secondary-foreground hover:text-secondary-foreground",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <Link to={item.href} className="flex items-center gap-2 w-full">
                <item.icon className="h-4 w-4" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
