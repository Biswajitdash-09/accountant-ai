
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  CreditCard, 
  FileText, 
  Calculator, 
  Upload, 
  Bot, 
  User,
  TrendingUp,
  BarChart3,
  X,
  ChevronLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/hooks/useDemoMode";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDemo } = useDemoMode();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
    { icon: CreditCard, label: "Accounts", href: "/accounts" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Calculator, label: "Tax", href: "/tax" },
    { icon: TrendingUp, label: "Financial Mgmt", href: "/financial-management" },
    { icon: Upload, label: "Upload", href: "/upload" },
    { icon: Bot, label: "Assistant", href: "/assistant" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname === href;
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const target = event.target as Node;
      
      if (isOpen && sidebar && !sidebar.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <div 
      id="sidebar"
      className={`
        flex flex-col h-full bg-card border-r border-border
        ${isCollapsed ? 'w-16' : 'w-64'}
        transition-all duration-200 ease-in-out
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">FM</span>
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-lg">FinanceManager</span>
            )}
          </div>
          
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 p-0"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link key={item.href} to={item.href} onClick={onClose}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  className={`
                    w-full justify-start gap-3 h-10
                    ${isCollapsed ? 'px-2' : 'px-3'}
                    ${active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-accent hover:text-accent-foreground'}
                  `}
                >
                  <Icon className={`h-4 w-4 ${isCollapsed ? 'mx-auto' : ''}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            {isDemo && (
              <div className="text-orange-600 font-medium">Demo Mode Active</div>
            )}
            {user && (
              <div className="truncate">{user.email}</div>
            )}
            <div>Finance Manager v2.0</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
