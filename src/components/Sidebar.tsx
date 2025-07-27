
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, CreditCard, FileText, Calculator, Upload, Bot, User, TrendingUp, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: Receipt
    },
    {
      name: "Accounts",
      href: "/accounts",
      icon: CreditCard
    },
    {
      name: "Financial Management",
      href: "/financial-management",
      icon: TrendingUp
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileText
    },
    {
      name: "Tax",
      href: "/tax",
      icon: Calculator
    },
    {
      name: "Upload",
      href: "/upload",
      icon: Upload
    },
    {
      name: "Assistant",
      href: "/assistant",
      icon: Bot
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User
    }
  ];

  const NavigationContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <span className="text-lg sm:text-xl font-bold">Accountant AI</span>
        </div>
        {(isMobile || isOpen) && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              onClose();
              setMobileMenuOpen(false);
            }}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 sm:p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => {
                onClose();
                setMobileMenuOpen(false);
              }}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-3 sm:py-2 text-sm font-medium transition-colors",
                "min-h-[48px] sm:min-h-[40px]", // Touch-friendly height
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <NavigationContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      {/* Desktop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose} 
        />
      )}
      
      {/* Desktop sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <NavigationContent />
      </aside>
    </>
  );
};

export default Sidebar;
