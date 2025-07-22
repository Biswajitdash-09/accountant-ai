
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  FileText,
  Calculator,
  Upload,
  Bot,
  X,
} from "lucide-react";

interface SidebarProps {
  activePath: string;
  onMobileClose?: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: CreditCard,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Tax",
    href: "/tax",
    icon: Calculator,
  },
  {
    name: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    name: "Assistant",
    href: "/assistant",
    icon: Bot,
  },
];

const Sidebar = ({ activePath, onMobileClose }: SidebarProps) => {
  const handleLinkClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-16 items-center justify-between px-6 border-b">
        <h1 className="text-xl font-semibold">Accountant AI</h1>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 hover:bg-accent rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
