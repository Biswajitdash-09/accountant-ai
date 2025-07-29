
import { useState, useEffect, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { NavigationBreadcrumbs } from "./Navigation/Breadcrumbs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import DemoAccountBadge from "./DemoAccountBadge";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      {!isMobile && (
        <div className="fixed inset-y-0 left-0 z-50">
          <Sidebar 
            isCollapsed={isSidebarCollapsed}
            onToggle={toggleSidebar}
            isMobileOpen={false}
            onMobileToggle={() => {}}
          />
        </div>
      )}

      {/* Sidebar - Mobile */}
      {isMobile && (
        <Sidebar 
          isCollapsed={false}
          onToggle={() => {}}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={toggleMobileMenu}
        />
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out w-full",
        !isMobile ? (isSidebarCollapsed ? "ml-16" : "ml-64") : "ml-0"
      )}>
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        {/* Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] max-w-full">
          {/* Demo Badge */}
          <div className="px-4 sm:px-6 lg:px-8 pt-4 mobile-safe">
            <DemoAccountBadge showExitButton />
          </div>
          
          {/* Breadcrumbs */}
          <div className="px-4 sm:px-6 lg:px-8 mobile-safe">
            <NavigationBreadcrumbs />
          </div>
          
          {/* Page Content */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8 mobile-safe mobile-bottom-safe">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
