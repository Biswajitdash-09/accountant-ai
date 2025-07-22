
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
} from "lucide-react";

interface SidebarProps {
  activePath: string;
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

const Sidebar = ({ activePath }: SidebarProps) => {
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-semibold">Accountant AI</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
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
