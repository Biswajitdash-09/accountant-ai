
import { useState, useEffect, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileHeader from "./mobile/MobileHeader";
import MobileBottomNav from "./mobile/MobileBottomNav";
import { NavigationBreadcrumbs } from "./Navigation/Breadcrumbs";
import { useIsMobile } from "@/hooks/use-mobile-enhanced";
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background w-full overflow-x-hidden">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <Sidebar 
          isCollapsed={false}
          onToggle={() => {}}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={toggleMobileMenu}
        />

        {/* Mobile Header */}
        <MobileHeader onMenuToggle={toggleMobileMenu} />
        
        {/* Main Content with Bottom Navigation Space */}
        <main className="min-h-[calc(100vh-3.5rem)] pb-20 mobile-scroll">
          {/* Demo Badge */}
          <div className="mobile-px pt-4">
            <DemoAccountBadge showExitButton />
          </div>
          
          {/* Breadcrumbs - Hidden on mobile by default */}
          <div className="mobile-px hidden sm:block">
            <NavigationBreadcrumbs />
          </div>
          
          {/* Page Content */}
          <div className="mobile-px pb-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobileOpen={false}
          onMobileToggle={() => {}}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out w-full",
        isSidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        {/* Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] max-w-full">
          {/* Demo Badge */}
          <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <DemoAccountBadge showExitButton />
          </div>
          
          {/* Breadcrumbs */}
          <div className="px-4 sm:px-6 lg:px-8">
            <NavigationBreadcrumbs />
          </div>
          
          {/* Page Content */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
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
