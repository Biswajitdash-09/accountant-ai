
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  ChevronLeft,
  ChevronRight,
  Dot,
  CreditCard,
  QrCode,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar = ({ isCollapsed, onToggle, isMobileOpen = false, onMobileToggle }: SidebarProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const menuSections = [
    {
      title: "Main",
      items: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          href: "/transactions",
          label: "Transactions", 
          icon: Receipt,
          badge: null,
        },
        {
          href: "/accounts",
          label: "Accounts",
          icon: Wallet,
          badge: null,
        },
      ]
    },
    {
      title: "Analytics",
      items: [
        {
          href: "/reports",
          label: "Reports",
          icon: FileText,
          badge: null,
        },
        {
          href: "/analytics",
          label: "Analytics",
          icon: BarChart3,
          badge: null,
        },
      ]
    },
    {
      title: "Tools",
      items: [
        {
          href: "/advanced-features",
          label: "Advanced",
          icon: Zap,
          badge: "Pro",
        },
        {
          href: "/performance",
          label: "Performance",
          icon: TrendingUp,
          badge: "PWA",
        },
        {
          href: "/security",
          label: "Security",
          icon: Bot,
          badge: null,
        },
        {
          href: "/tax",
          label: "Tax Center",
          icon: Calculator,
          badge: null,
        },
        {
          href: "/upload",
          label: "Documents",
          icon: Upload,
          badge: null,
        },
        {
          href: "/assistant",
          label: "AI Assistant",
          icon: Bot,
          badge: "AI",
        },
        {
          href: "/markets",
          label: "Markets",
          icon: TrendingUp,
          badge: null,
        },
        {
          href: "/scan-history",
          label: "Scan History", 
          icon: QrCode,
          badge: null,
        },
        {
          href: "/performance",
          label: "Performance",
          icon: Zap,
          badge: "PWA",
        },
      ]
    },
    {
      title: "Credits & Billing",
      items: [
        {
          href: "/pricing",
          label: "Buy Credits",
          icon: CreditCard,
          badge: "New",
        },
      ]
    },
    {
      title: "Account",
      items: [
        {
          href: "/profile",
          label: "Profile",
          icon: User,
          badge: null,
        },
      ]
    }
  ];

  const SidebarContent = ({ isMobileSheet = false }: { isMobileSheet?: boolean }) => (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-base truncate">Accountant AI</h2>
              <p className="text-xs text-muted-foreground">Financial Management</p>
            </div>
          </div>
        )}
        
        {/* Collapse toggle - desktop only */}
        {!isMobileSheet && !isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto shrink-0 btn-enhanced h-8 w-8"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
      <ScrollArea className="flex-1 px-3 custom-scrollbar">
        <div className="space-y-6 py-4">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-start font-normal transition-all duration-200 mobile-touch",
                        isActive 
                          ? "ui-nav-active shadow-sm" 
                          : "ui-nav-item hover:bg-accent/50",
                        isCollapsed && !isMobileSheet ? "px-2 justify-center" : "px-3"
                      )}
                      onClick={() => {
                        if (isMobileSheet && onMobileToggle) {
                          onMobileToggle();
                        }
                      }}
                    >
                      <Link to={item.href} className="flex items-center gap-3 w-full">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {(!isCollapsed || isMobileSheet) && (
                          <>
                            <span className="truncate flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge 
                                variant={item.badge === "Pro" ? "default" : item.badge === "New" ? "secondary" : "secondary"} 
                                className={cn(
                                  "text-xs px-1.5 py-0.5 h-5",
                                  item.badge === "New" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                        {isActive && !isCollapsed && (
                          <Dot className="h-4 w-4 text-primary animate-pulse" />
                        )}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-3 mobile-bottom-safe">
        <Button
          variant="outline"
          className="w-full justify-center btn-enhanced mobile-touch hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          onClick={handleSignOut}
          disabled={isLoggingOut}
        >
          {!isCollapsed && (
            <span className="truncate">
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  // Mobile view with Sheet
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={onMobileToggle}>
        <SheetContent 
          side="left" 
          className="w-80 p-0 ui-glass border-r"
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent isMobileSheet={true} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop view
  return (
    <div
      className={cn(
        "flex flex-col h-full ui-glass border-r shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
