import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Receipt, CreditCard, FileText, Calculator, Upload, Bot, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const Sidebar = ({
  isOpen,
  onClose
}: SidebarProps) => {
  const location = useLocation();
  const navigation = [{
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  }, {
    name: "Transactions",
    href: "/transactions",
    icon: Receipt
  }, {
    name: "Accounts",
    href: "/accounts",
    icon: CreditCard
  }, {
    name: "Reports",
    href: "/reports",
    icon: FileText
  }, {
    name: "Tax",
    href: "/tax",
    icon: Calculator
  }, {
    name: "Upload",
    href: "/upload",
    icon: Upload
  }, {
    name: "Assistant",
    href: "/assistant",
    icon: Bot
  }, {
    name: "Profile",
    href: "/profile",
    icon: User
  }];
  return <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      
      {/* Sidebar */}
      <aside className={cn("fixed left-0 top-0 z-50 h-full w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out lg:static lg:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Accountant AI</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return <Link key={item.name} to={item.href} onClick={onClose} className={cn("flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>;
          })}
          </nav>

          {/* Footer */}
          
        </div>
      </aside>
    </>;
};
export default Sidebar;