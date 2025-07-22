
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  BarChart4, 
  FileText, 
  Upload, 
  MessageSquare, 
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  path, 
  active = false 
}: { 
  icon: React.ElementType; 
  label: string; 
  path: string; 
  active?: boolean;
}) => {
  return (
    <Link 
      to={path}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

interface SidebarProps {
  activePath: string;
}

const Sidebar = ({ activePath }: SidebarProps) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Receipt, label: "Transactions", path: "/transactions" },
    { icon: CreditCard, label: "Accounts", path: "/accounts" },
    { icon: BarChart4, label: "Reports", path: "/reports" },
    { icon: FileText, label: "Tax", path: "/tax" },
    { icon: Upload, label: "Upload", path: "/upload" },
    { icon: MessageSquare, label: "AI Assistant", path: "/assistant" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar flex flex-col fixed left-0 top-0 border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sidebar-foreground flex items-center">
          <span className="mr-2">IntellyFin</span>
          <span className="text-xs bg-finance-highlight text-black px-2 py-0.5 rounded">AI</span>
        </h1>
      </div>
      
      <div className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={activePath === item.path}
          />
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
