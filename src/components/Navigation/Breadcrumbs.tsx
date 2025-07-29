
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  "/dashboard": { label: "Dashboard" },
  "/transactions": { label: "Transactions" },
  "/accounts": { label: "Accounts" },
  "/reports": { label: "Reports" },
  "/analytics": { label: "Analytics" },
  "/advanced-features": { label: "Advanced Features" },
  "/tax": { label: "Tax Center" },
  "/upload": { label: "Documents" },
  "/assistant": { label: "AI Assistant" },
  "/markets": { label: "Markets" },
  "/profile": { label: "Profile" },
  "/notifications": { label: "Notifications" },
};

export const NavigationBreadcrumbs = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Don't show breadcrumbs on dashboard
  if (currentPath === "/dashboard" || currentPath === "/") {
    return null;
  }

  const currentConfig = breadcrumbConfig[currentPath];
  
  if (!currentConfig) {
    return null;
  }

  return (
    <div className="mb-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Home className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {currentConfig.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
